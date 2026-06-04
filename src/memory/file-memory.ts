import crypto from "crypto";
import fs from "fs";
import path from "path";
import type {
  ComponentHierarchy,
  MemorySession,
  RequirementsAnalysis,
  ValidationResult,
  WidgetNode,
} from "@/types/pipeline";

const MEMORY_DIR = path.join(process.cwd(), "memory");
const SESSIONS_FILE = path.join(MEMORY_DIR, "sessions.json");

function ensureMemoryDir(): void {
  fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

function readAllSessions(): MemorySession[] {
  ensureMemoryDir();
  if (!fs.existsSync(SESSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw) as MemorySession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllSessions(sessions: MemorySession[]): void {
  ensureMemoryDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

function hashRequirement(requirement: string): string {
  return crypto.createHash("sha256").update(requirement.trim()).digest("hex");
}

export function findSimilarSession(requirement: string): MemorySession | null {
  const id = hashRequirement(requirement);
  return readAllSessions().find((s) => s.id === id) ?? null;
}

export function saveSession(input: {
  threadId: string;
  requirement: string;
  productAnalysis: RequirementsAnalysis;
  componentHierarchy: ComponentHierarchy;
  widgetTree: WidgetNode[];
  generatedFiles: Record<string, string>;
  validation: ValidationResult;
}): MemorySession {
  const id = hashRequirement(input.requirement);
  const session: MemorySession = {
    id,
    threadId: input.threadId,
    createdAt: new Date().toISOString(),
    requirement: input.requirement,
    productName: input.productAnalysis.product_name,
    features: input.productAnalysis.features,
    componentHierarchy: input.componentHierarchy,
    widgetTree: input.widgetTree,
    generatedFiles: input.generatedFiles,
    validationValid: input.validation.valid,
  };

  const sessions = readAllSessions().filter((s) => s.id !== id);
  sessions.push(session);
  writeAllSessions(sessions);
  return session;
}

export function listSessions(limit = 20): MemorySession[] {
  return readAllSessions()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
