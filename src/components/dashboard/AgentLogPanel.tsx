"use client";

import type { AgentLog, ToolLog } from "@/types/pipeline";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AgentLogPanel({ logs, toolLogs }: { logs: AgentLog[]; toolLogs: ToolLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-slate-500">Agent execution trace will appear after generation.</p>;
  }

  return (
    <ScrollArea className="h-[200px]">
      <div className="space-y-3 pr-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Agents</p>
          <ul className="space-y-2">
            {logs.map((log) => (
              <li key={`${log.role}-${log.timestamp}`} className="rounded-lg border border-slate-700/60 p-2">
                <div className="flex items-center gap-2">
                  <Badge>{log.role}</Badge>
                  <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1 text-sm text-slate-300">{log.decision}</p>
                <p className="mt-1 text-xs text-slate-500">Tools: {log.toolsInvoked.join(", ")}</p>
              </li>
            ))}
          </ul>
        </div>
        {!!toolLogs.length && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-slate-500">Tool execution</p>
            <ul className="space-y-2">
              {toolLogs.map((t) => (
                <li key={`${t.tool}-${t.timestamp}`} className="rounded border border-slate-800 p-2 text-xs">
                  <span className="font-mono text-bridge-300">{t.tool}</span>
                  <p className="text-slate-500">In: {t.inputSummary.slice(0, 80)}…</p>
                  <p className="text-slate-400">Out: {t.outputSummary.slice(0, 100)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
