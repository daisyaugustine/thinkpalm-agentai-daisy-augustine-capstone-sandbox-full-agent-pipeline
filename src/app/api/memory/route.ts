import { NextResponse } from "next/server";
import { listSessions } from "@/memory/file-memory";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessions = listSessions(30);
    return NextResponse.json({ sessions });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to load memory history.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
