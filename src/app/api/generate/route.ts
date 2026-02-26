import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const PROMPTS: Record<string, string> = {
  acceptance_criteria: `Generate acceptance criteria for this user story. Return ONLY a JSON array of strings, each in Given/When/Then format.
Example: ["Given a user is on the login page, When they enter valid credentials, Then they are redirected to the dashboard"]

User Story:`,

  test_cases: `Generate test cases for this user story and its acceptance criteria. Return ONLY valid JSON array:
[{"title":"Test case title","description":"What is being tested","preconditions":"Setup needed","steps":"1. Step one\\n2. Step two","expected_result":"Expected outcome","severity":"major","test_type":"e2e"}]

Severity options: blocker, critical, major, minor
Type options: e2e, unit, integration, manual

User Story:`,

  backlog_from_session: `Analyze this voice session transcript and generate a complete product backlog. Return ONLY valid JSON:
{"epics":[{"title":"Epic Name","description":"Epic description","stories":[{"title":"Story Title","story_format":"As a [user], I want to [action] so that [benefit]","criteria":["Criterion 1","Criterion 2"],"estimate_hours":5}]}]}

Group features into logical epics. Write proper user stories. Estimate conservatively (3-8 hrs per story).

Transcript:`,

  sprint_plan: `Given these backlog items, create a sprint plan. Group items into a logical sprint, estimate total hours, and suggest a sprint name. Return ONLY valid JSON:
{"sprint_name":"Sprint Name","goal":"Sprint goal","duration_weeks":1,"tasks":[{"id":"existing-task-id","title":"Task title","estimate_hours":5,"priority":"high"}],"total_hours":30}

Backlog Items:`,
};

export async function POST(request: NextRequest) {
  try {
    const { type, content, context } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const prompt = PROMPTS[type];
    if (!prompt) {
      return NextResponse.json({ error: `Unknown generation type: ${type}` }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${prompt}\n\n${content}${context ? `\n\nAdditional context:\n${context}` : ''}`,
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    let parsed;
    try {
      const jsonMatch = text.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: text }, { status: 500 });
    }

    return NextResponse.json({ data: parsed });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
