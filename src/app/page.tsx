"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Anchor, Download, Ship, Sparkles } from "lucide-react";
import type { MemorySession, PipelineOutput } from "@/types/pipeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentTreeView } from "@/components/dashboard/ComponentTreeView";
import { CodePanel } from "@/components/dashboard/CodePanel";
import { AgentLogPanel } from "@/components/dashboard/AgentLogPanel";
import { MemoryPanel } from "@/components/dashboard/MemoryPanel";
import { downloadAllCode, downloadJson, downloadProjectZip } from "@/lib/export";

const SandpackLivePreview = dynamic(
  () => import("@/components/dashboard/SandpackPreview").then((m) => m.SandpackLivePreview),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-lg bg-slate-800/50" /> },
);

const demoRequirement = `Vessel Monitoring System — Product Requirements

Product: Vessel Monitoring System for fleet operations center.

Features required:
- Real-time voyage tracking from Singapore to Fujairah
- Fuel monitoring and bunker analytics
- Crew STCW certification validity dashboard
- Weather and collision alerts
- Maintenance schedules and compliance panel

Vessel Name: MV ThinkPalm Aurora
Voyage Stage: Singapore to Fujairah`;

export default function Home() {
  const [requirement, setRequirement] = useState(demoRequirement);
  const [result, setResult] = useState<PipelineOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement }),
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = typeof data.details === "string" ? `: ${data.details}` : "";
        throw new Error(`${data.error ?? "Generation failed"}${detail}`);
      }
      setResult(data as PipelineOutput);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function loadMemorySession(session: MemorySession) {
    setRequirement(session.requirement);
    setResult({
      threadId: session.threadId,
      productAnalysis: {
        product_name: session.productName,
        features: session.features,
      },
      componentHierarchy: session.componentHierarchy,
      widgetTree: session.widgetTree,
      generatedFiles: session.generatedFiles,
      validation: { valid: session.validationValid, errors: [] },
      memoryHit: session,
      memorySession: session,
      logs: [],
      toolLogs: [],
    });
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bridge-600/20 text-bridge-400">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BridgeView AI</h1>
              <p className="text-xs text-slate-400">Maritime PRD → LangGraph multi-agent UI pipeline</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>4 Agents</Badge>
            <Badge>LangGraph</Badge>
            <Badge variant="success">File Memory</Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-4 p-4 md:p-6">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Left — requirements */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Anchor className="h-4 w-4 text-bridge-400" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                className="h-56 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-bridge-500/50"
                placeholder="Paste maritime PRD…"
              />
              <Button onClick={generate} disabled={loading} className="mt-3 w-full">
                <Sparkles className="h-4 w-4" />
                {loading ? "Running pipeline…" : "Generate Maritime UI"}
              </Button>
              {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              {result && (
                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <p>
                    <span className="text-slate-300">Product:</span> {result.productAnalysis.product_name}
                  </p>
                  <p>
                    <span className="text-slate-300">Features:</span> {result.productAnalysis.features.join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Center — component tree */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Component Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <ComponentTreeView
                hierarchy={result?.componentHierarchy ?? null}
                widgetTree={result?.widgetTree ?? []}
              />
            </CardContent>
          </Card>

          {/* Right — generated code */}
          <Card className="lg:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Generated Code</CardTitle>
              {result && (
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadJson("component-tree.json", result.componentHierarchy)}
                  >
                    <Download className="h-3 w-3" /> JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAllCode(result.generatedFiles)}>
                    Code
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      downloadProjectZip(result.generatedFiles, result.productAnalysis.product_name)
                    }
                  >
                    ZIP
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <CodePanel files={result?.generatedFiles ?? {}} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom — live preview */}
        <Card>
          <CardHeader>
            <CardTitle>Live React Preview (Sandpack)</CardTitle>
          </CardHeader>
          <CardContent>
            <SandpackLivePreview files={result?.generatedFiles ?? {}} />
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Agent Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentLogPanel logs={result?.logs ?? []} toolLogs={result?.toolLogs ?? []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Memory History</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoryPanel currentSession={result?.memorySession} onSelect={loadMemorySession} />
              {result?.memoryHit && (
                <p className="mt-2 text-xs text-amber-400/90">
                  Similar PRD found in memory — context available for this requirement hash.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {result && (
          <p className="text-center text-xs text-slate-600">
            Thread {result.threadId} · Validation {result.validation.valid ? "passed" : "corrected"} ·{" "}
            {Object.keys(result.generatedFiles).length} files
          </p>
        )}
      </main>
    </div>
  );
}
