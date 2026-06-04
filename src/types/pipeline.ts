import { z } from "zod";

export const RequirementsAnalysisSchema = z.object({
  product_name: z.string(),
  features: z.array(z.string()),
  domain_entities: z.array(z.string()).optional(),
  dashboard_widgets: z.array(z.string()).optional(),
});

export type RequirementsAnalysis = z.infer<typeof RequirementsAnalysisSchema>;

export type ComponentHierarchy = Record<string, Record<string, unknown> | unknown>;

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.string()),
  correctedFiles: z.record(z.string()).optional(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export type AgentRole =
  | "requirements-analyst"
  | "ui-architect"
  | "code-generator"
  | "validation";

export interface AgentLog {
  role: AgentRole;
  decision: string;
  toolsInvoked: string[];
  timestamp: string;
  details?: string;
}

export interface ToolLog {
  tool: string;
  inputSummary: string;
  outputSummary: string;
  timestamp: string;
}

export interface WidgetNode {
  id: string;
  type: "section" | "card" | "metric" | "alert" | "header" | "table";
  title: string;
  description: string;
  children?: WidgetNode[];
}

export interface MemorySession {
  id: string;
  threadId: string;
  createdAt: string;
  requirement: string;
  productName: string;
  features: string[];
  componentHierarchy: ComponentHierarchy;
  widgetTree: WidgetNode[];
  generatedFiles: Record<string, string>;
  validationValid: boolean;
}

export interface PipelineOutput {
  threadId: string;
  productAnalysis: RequirementsAnalysis;
  componentHierarchy: ComponentHierarchy;
  widgetTree: WidgetNode[];
  generatedFiles: Record<string, string>;
  validation: ValidationResult;
  memoryHit: MemorySession | null;
  memorySession: MemorySession;
  logs: AgentLog[];
  toolLogs: ToolLog[];
}

export interface BridgeViewGraphState {
  requirement: string;
  threadId: string;
  productAnalysis?: RequirementsAnalysis;
  componentHierarchy?: ComponentHierarchy;
  widgetTree?: WidgetNode[];
  generatedFiles?: Record<string, string>;
  validation?: ValidationResult;
  logs: AgentLog[];
  toolLogs: ToolLog[];
  memoryHit?: MemorySession | null;
}
