"use client";

import type { ReactNode } from "react";
import type { ComponentHierarchy, WidgetNode } from "@/types/pipeline";
import { ChevronRight } from "lucide-react";

function TreeNode({ name, depth }: { name: string; depth: number }) {
  return (
    <div
      className="flex items-center gap-1 py-1 text-sm text-slate-300"
      style={{ paddingLeft: `${depth * 16}px` }}
    >
      <ChevronRight className="h-3.5 w-3.5 text-bridge-400" />
      <span className="font-mono text-slate-200">{name}</span>
    </div>
  );
}

function renderHierarchy(hierarchy: ComponentHierarchy, depth = 0): ReactNode[] {
  return Object.entries(hierarchy).flatMap(([key, value]) => {
    const nodes: ReactNode[] = [<TreeNode key={`${depth}-${key}`} name={key} depth={depth} />];
    if (value && typeof value === "object" && Object.keys(value as object).length) {
      nodes.push(...renderHierarchy(value as ComponentHierarchy, depth + 1));
    }
    return nodes;
  });
}

export function ComponentTreeView({
  hierarchy,
  widgetTree,
}: {
  hierarchy: ComponentHierarchy | null;
  widgetTree: WidgetNode[];
}) {
  if (!hierarchy && !widgetTree.length) {
    return <p className="text-sm text-slate-500">Run the pipeline to visualize the component tree.</p>;
  }

  return (
    <div className="space-y-4">
      {hierarchy && <div>{renderHierarchy(hierarchy)}</div>}
      {!!widgetTree.length && (
        <div className="border-t border-slate-700 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Widget nodes</p>
          <div className="grid gap-2">
            {widgetTree.map((node) => (
              <div key={node.id} className="rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-2">
                <span className="text-sm font-medium text-white">{node.title}</span>
                <span className="ml-2 text-xs text-slate-500">{node.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
