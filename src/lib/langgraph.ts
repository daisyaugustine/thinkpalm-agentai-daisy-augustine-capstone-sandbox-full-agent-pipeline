import { END, START, StateGraph, Annotation, MemorySaver } from "@langchain/langgraph";
import type { BridgeViewGraphState, PipelineOutput } from "@/types/pipeline";
import { runRequirementsAnalystAgent } from "@/agents/requirements-agent";
import { runUIArchitectAgent } from "@/agents/ui-architect-agent";
import { runCodeGeneratorAgent } from "@/agents/code-generator-agent";
import { runValidationAgent } from "@/agents/validation-agent";
import { findSimilarSession, saveSession } from "@/memory/file-memory";

const GraphState = Annotation.Root({
  requirement: Annotation<string>,
  threadId: Annotation<string>,
  productAnalysis: Annotation<BridgeViewGraphState["productAnalysis"]>,
  componentHierarchy: Annotation<BridgeViewGraphState["componentHierarchy"]>,
  widgetTree: Annotation<BridgeViewGraphState["widgetTree"]>,
  generatedFiles: Annotation<BridgeViewGraphState["generatedFiles"]>,
  validation: Annotation<BridgeViewGraphState["validation"]>,
  logs: Annotation<BridgeViewGraphState["logs"]>,
  toolLogs: Annotation<BridgeViewGraphState["toolLogs"]>,
  memoryHit: Annotation<BridgeViewGraphState["memoryHit"]>,
});

const checkpointer = new MemorySaver();

function buildGraph() {
  const workflow = new StateGraph(GraphState)
    .addNode("requirementsAnalyst", runRequirementsAnalystAgent)
    .addNode("uiArchitect", runUIArchitectAgent)
    .addNode("codeGenerator", runCodeGeneratorAgent)
    .addNode("validateCode", runValidationAgent)
    .addNode("memorySave", async (state: BridgeViewGraphState) => {
      if (
        !state.productAnalysis ||
        !state.componentHierarchy ||
        !state.widgetTree ||
        !state.generatedFiles ||
        !state.validation
      ) {
        throw new Error("Incomplete state at memory save.");
      }

      const memorySession = saveSession({
        threadId: state.threadId,
        requirement: state.requirement,
        productAnalysis: state.productAnalysis,
        componentHierarchy: state.componentHierarchy,
        widgetTree: state.widgetTree,
        generatedFiles: state.generatedFiles,
        validation: state.validation,
      });

      return {
        logs: [
          ...state.logs,
          {
            role: "validation" as const,
            decision: `Saved generation to file memory (session ${memorySession.id.slice(0, 12)}…).`,
            toolsInvoked: ["file-memory", "langgraph-checkpointer"],
            timestamp: new Date().toISOString(),
          },
        ],
        toolLogs: [
          ...state.toolLogs,
          {
            tool: "memory-save",
            inputSummary: state.threadId,
            outputSummary: memorySession.id,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    })
    .addEdge(START, "requirementsAnalyst")
    .addEdge("requirementsAnalyst", "uiArchitect")
    .addEdge("uiArchitect", "codeGenerator")
    .addEdge("codeGenerator", "validateCode")
    .addEdge("validateCode", "memorySave")
    .addEdge("memorySave", END);

  return workflow.compile({ checkpointer });
}

let compiledGraph: ReturnType<typeof buildGraph> | null = null;

export async function runBridgeViewGraph(requirement: string): Promise<PipelineOutput> {
  const threadId = `thread-${Date.now()}`;
  const memoryHit = findSimilarSession(requirement);

  const initialState: BridgeViewGraphState = {
    requirement,
    threadId,
    logs: [],
    toolLogs: [],
    memoryHit,
  };

  if (!compiledGraph) {
    compiledGraph = buildGraph();
  }

  const result = await compiledGraph.invoke(initialState, {
    configurable: { thread_id: threadId },
  });

  if (
    !result.productAnalysis ||
    !result.componentHierarchy ||
    !result.widgetTree ||
    !result.generatedFiles ||
    !result.validation
  ) {
    throw new Error("LangGraph pipeline did not produce complete output.");
  }

  const memorySession = findSimilarSession(requirement);
  if (!memorySession) {
    throw new Error("Memory session was not persisted.");
  }

  return {
    threadId,
    productAnalysis: result.productAnalysis,
    componentHierarchy: result.componentHierarchy,
    widgetTree: result.widgetTree,
    generatedFiles: result.generatedFiles,
    validation: result.validation,
    memoryHit,
    memorySession,
    logs: result.logs,
    toolLogs: result.toolLogs,
  };
}
