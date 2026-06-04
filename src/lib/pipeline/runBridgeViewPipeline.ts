import type { PipelineOutput } from "@/types/pipeline";
import { runBridgeViewGraph } from "@/lib/langgraph";

export async function runBridgeViewPipeline(requirement: string): Promise<PipelineOutput> {
  return runBridgeViewGraph(requirement);
}
