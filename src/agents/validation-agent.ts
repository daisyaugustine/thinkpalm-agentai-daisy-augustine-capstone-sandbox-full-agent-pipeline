import type { AgentLog, BridgeViewGraphState } from "@/types/pipeline";
import { validateJsx } from "@/tools/validator-tool";

export async function runValidationAgent(
  state: BridgeViewGraphState,
): Promise<Partial<BridgeViewGraphState>> {
  if (!state.generatedFiles) {
    throw new Error("Generated files missing for validation.");
  }

  const validation = await validateJsx(state.generatedFiles);
  const generatedFiles =
    !validation.valid && validation.correctedFiles
      ? validation.correctedFiles
      : state.generatedFiles;

  const log: AgentLog = {
    role: "validation",
    decision: validation.valid
      ? "All generated JSX files passed validation."
      : `Applied auto-corrections for ${validation.errors.length} issue(s).`,
    toolsInvoked: ["validateJsx"],
    timestamp: new Date().toISOString(),
    details: validation.errors.join("; ") || "OK",
  };

  return {
    generatedFiles,
    validation,
    logs: [...state.logs, log],
    toolLogs: [
      ...state.toolLogs,
      {
        tool: "jsx-validator",
        inputSummary: `${Object.keys(state.generatedFiles).length} files`,
        outputSummary: validation.valid ? "valid" : validation.errors.join("; "),
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
