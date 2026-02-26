import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const INSIGHTS_PROMPT = `You are analyzing a voice conversation between a requirements engineer (AI) and a product stakeholder (Customer). Generate structured insights from this transcript.

Return ONLY valid JSON in this exact format:
{
  "session_name": "Short descriptive title for this session (e.g., 'E-Commerce Platform Requirements')",
  "summary": "2-3 sentence summary of what was discussed and decided",
  "key_takeaways": [
    "Takeaway 1 - bold the important term",
    "Takeaway 2",
    "Takeaway 3"
  ],
  "topics": [
    {
      "title": "Topic Category Name",
      "points": [
        {"label": "Key Term", "detail": "Explanation of what was discussed"},
        {"label": "Another Term", "detail": "Details"}
      ]
    }
  ],
  "epics": [
    {
      "title": "Epic Name",
      "description": "Brief description of the epic",
      "stories": [
        {
          "title": "User Story Title",
          "story_format": "As a [user type], I want to [action] so that [benefit]",
          "criteria": ["Acceptance criterion 1", "Acceptance criterion 2"],
          "estimate_hours": 5
        }
      ]
    }
  ]
}

Important:
- Extract real insights from the conversation, don't invent features
- Group related features into logical epics
- Write acceptance criteria in Given/When/Then format where possible
- Estimate hours conservatively (3-8 hours per story typically)
- Key takeaways should capture decisions and important requirements
- Topics should group discussion points thematically (Core Features, Technical Constraints, User Personas, etc.)`;

export async function POST(request: NextRequest) {
  try {
    const { transcript, customerName, customerEmail, customerCompany, projectBrief } =
      await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'No transcript provided' },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: INSIGHTS_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Customer: ${customerName} (${customerCompany || 'N/A'})
Brief: ${projectBrief || 'N/A'}

Transcript:
${transcript}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    if (!parsed) {
      return NextResponse.json(
        { error: 'No structured data generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session_name: parsed.session_name || `${customerName}'s Session`,
      ai_insights: {
        summary: parsed.summary || '',
        key_takeaways: parsed.key_takeaways || [],
        topics: parsed.topics || [],
      },
      ai_output: {
        epics: parsed.epics || [],
      },
    });
  } catch (error: any) {
    console.error('Voice session processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
