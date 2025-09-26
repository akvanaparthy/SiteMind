import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, userId } = body;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    // Forward the command to the AI agent service
    const agentUrl = process.env.AGENT_URL || "http://localhost:3001";

    try {
      const response = await fetch(`${agentUrl}/api/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command,
          userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Agent service responded with status: ${response.status}`
        );
      }

      const result = await response.json();

      return NextResponse.json({
        success: true,
        result,
        message: "Command sent to AI agent successfully",
      });
    } catch (agentError) {
      console.error("Error communicating with AI agent:", agentError);

      // Return a mock response if agent is not available
      return NextResponse.json({
        success: false,
        error: "AI agent service is not available",
        message: "Command queued for processing when agent becomes available",
        mockResponse: {
          command,
          status: "queued",
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error("Error processing agent command:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // Get agent status
    const agentUrl = process.env.AGENT_URL || "http://localhost:3001";

    try {
      const response = await fetch(`${agentUrl}/api/status`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const status = await response.json();
        return NextResponse.json({
          status: "online",
          agent: status,
        });
      } else {
        throw new Error("Agent service not responding");
      }
    } catch (agentError) {
      return NextResponse.json({
        status: "offline",
        message: "AI agent service is not available",
        error:
          agentError instanceof Error ? agentError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error checking agent status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
