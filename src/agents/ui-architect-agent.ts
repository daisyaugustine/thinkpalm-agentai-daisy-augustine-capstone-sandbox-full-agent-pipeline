import type { AgentLog, BridgeViewGraphState } from "@/types/pipeline";
import { generateComponentTree } from "@/tools/component-tree-tool";

export async function runUIArchitectAgent(
  state: BridgeViewGraphState,
): Promise<Partial<BridgeViewGraphState>> {
  if (!state.productAnalysis) {
    throw new Error("Requirements analysis missing for UI architect.");
  }

  const { hierarchy, widgetTree } = await generateComponentTree(state.productAnalysis);

  const log: AgentLog = {
    role: "ui-architect",
    decision: `Built UI hierarchy with ${Object.keys(hierarchy.Dashboard ?? {}).length} dashboard components.`,
    toolsInvoked: ["generateComponentTree"],
    timestamp: new Date().toISOString(),
    details: JSON.stringify(hierarchy, null, 0).slice(0, 200),
  };

  return {
    componentHierarchy: hierarchy,
    widgetTree,
    logs: [...state.logs, log],
    toolLogs: [
      ...state.toolLogs,
      {
        tool: "component-tree-generator",
        inputSummary: JSON.stringify(state.productAnalysis.features),
        outputSummary: JSON.stringify(hierarchy),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
