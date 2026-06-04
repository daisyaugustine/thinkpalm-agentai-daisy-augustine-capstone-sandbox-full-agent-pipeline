import type { AgentLog, BridgeViewGraphState } from "@/types/pipeline";
import { extractFeatures } from "@/tools/feature-tool";

export async function runRequirementsAnalystAgent(
  state: BridgeViewGraphState,
): Promise<Partial<BridgeViewGraphState>> {
  const productAnalysis = await extractFeatures(state.requirement);

  const log: AgentLog = {
    role: "requirements-analyst",
    decision: `Analyzed PRD for "${productAnalysis.product_name}" with ${productAnalysis.features.length} features.`,
    toolsInvoked: ["extractFeatures"],
    timestamp: new Date().toISOString(),
    details: productAnalysis.features.join(", "),
  };

  return {
    productAnalysis,
    logs: [...state.logs, log],
    toolLogs: [
      ...state.toolLogs,
      {
        tool: "feature-extraction",
        inputSummary: state.requirement.slice(0, 120),
        outputSummary: JSON.stringify(productAnalysis),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
