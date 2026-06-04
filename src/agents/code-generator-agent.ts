import type { AgentLog, BridgeViewGraphState } from "@/types/pipeline";
import { exportReactFiles } from "@/tools/export-tool";

export async function runCodeGeneratorAgent(
  state: BridgeViewGraphState,
): Promise<Partial<BridgeViewGraphState>> {
  if (!state.widgetTree?.length) {
    throw new Error("Widget tree missing for code generator.");
  }

  const generatedFiles = await exportReactFiles(
    state.widgetTree,
    state.productAnalysis,
  );

  const log: AgentLog = {
    role: "code-generator",
    decision: `Generated ${Object.keys(generatedFiles).length} React + TypeScript + Tailwind files.`,
    toolsInvoked: ["exportReactFiles"],
    timestamp: new Date().toISOString(),
  };

  return {
    generatedFiles,
    logs: [...state.logs, log],
    toolLogs: [
      ...state.toolLogs,
      {
        tool: "react-export",
        inputSummary: `${state.widgetTree.length} widgets`,
        outputSummary: Object.keys(generatedFiles).join(", "),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
