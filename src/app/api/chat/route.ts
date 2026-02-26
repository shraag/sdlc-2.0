import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Foundry AI, an intelligent project management assistant built into an SDLC platform. You help software teams with:

- **User Stories**: Generate well-structured user stories in "As a [user], I want to [action] so that [benefit]" format with acceptance criteria in Given/When/Then format
- **Test Cases**: Create comprehensive test cases with preconditions, steps, and expected results
- **Sprint Planning**: Help plan sprints by grouping backlog items, estimating effort, and setting goals
- **Bug Triage**: Analyze bugs and suggest severity, priority, and resolution approach
- **Technical Architecture**: Suggest patterns, technologies, and design decisions
- **Documentation**: Generate wiki content, API docs, and meeting notes

## Response Guidelines
- Be concise and actionable
- Use markdown formatting: headers (##), bullets (-), bold (**text**), numbered lists
- When generating structured content, use clear formatting
- When asked to create tasks or stories, format them clearly with titles, descriptions, and acceptance criteria
- Estimate hours conservatively (3-8 hours per story)`;

export async function POST(request: NextRequest) {
  try {
    const { messages, projectId, context, actionMode } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { content: 'AI Assistant is not configured. Add ANTHROPIC_API_KEY to your environment variables.' },
        { status: 200 }
      );
    }

    let systemPrompt = SYSTEM_PROMPT;
    if (projectId) {
      systemPrompt += `\n\nYou are currently in the context of a project (ID: ${projectId}).`;
    }
    if (context) {
      systemPrompt += `\nThe user is currently on: ${context}`;
    }
    if (actionMode) {
      systemPrompt += `\n\nAction Mode is enabled. When the user asks you to create items (tasks, stories, test cases), format your response clearly so they can be easily copied or acted upon.`;
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { content: 'Sorry, something went wrong. Please try again.' },
      { status: 200 }
    );
  }
}
