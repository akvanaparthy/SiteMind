import { NextRequest, NextResponse } from 'next/server';

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:3002';

/**
 * POST /api/agent/command
 * Send command to AI agent service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, prompt, history } = body;

    if (!command && !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: command or prompt' },
        { status: 400 }
      );
    }

    // Forward to agent service with optional conversation history
    const response = await fetch(`${AGENT_SERVICE_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command: command || prompt,
        history: history || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent service error: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API] Error executing agent command:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to execute command',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/command
 * Get agent status
 */
export async function GET() {
  try {
    const response = await fetch(`${AGENT_SERVICE_URL}/status`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Agent service unavailable');
    }

    const status = await response.json();

    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Agent service unavailable',
        data: { status: 'offline' },
      },
      { status: 503 }
    );
  }
}
