"use client";

import { useEffect, useState } from "react";
import type { MemorySession } from "@/types/pipeline";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function MemoryPanel({
  currentSession,
  onSelect,
}: {
  currentSession?: MemorySession | null;
  onSelect?: (session: MemorySession) => void;
}) {
  const [sessions, setSessions] = useState<MemorySession[]>([]);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]));
  }, [currentSession?.id]);

  return (
    <ScrollArea className="h-[220px]">
      <div className="space-y-2 pr-2">
        {currentSession && (
          <div className="rounded-lg border border-bridge-500/30 bg-bridge-950/20 p-2">
            <p className="text-xs text-bridge-300">Current session</p>
            <p className="text-sm font-medium text-white">{currentSession.productName}</p>
            <p className="text-xs text-slate-500">{currentSession.features.length} features</p>
          </div>
        )}
        <p className="text-xs font-medium uppercase text-slate-500">Previous generations</p>
        {!sessions.length && <p className="text-sm text-slate-500">No saved sessions yet.</p>}
        {sessions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect?.(s)}
            className="w-full rounded-lg border border-slate-700/60 bg-slate-950/40 p-2 text-left hover:border-bridge-500/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-200">{s.productName}</span>
              {s.validationValid && <Badge variant="success">valid</Badge>}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{s.requirement.slice(0, 100)}…</p>
            <p className="mt-1 text-xs text-slate-600">{new Date(s.createdAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
