import { NextResponse } from "next/server";
import { runBridgeViewPipeline } from "@/lib/pipeline/runBridgeViewPipeline";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { requirement?: string };
    const requirement = body.requirement?.trim();

    if (!requirement) {
      return NextResponse.json({ error: "Requirement text is required." }, { status: 400 });
    }

    const result = await runBridgeViewPipeline(requirement);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Pipeline execution failed.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
