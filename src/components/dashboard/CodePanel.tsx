"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CodePanel({ files }: { files: Record<string, string> }) {
  const entries = Object.entries(files);

  if (!entries.length) {
    return <p className="text-sm text-slate-500">Generated React code will appear here.</p>;
  }

  return (
    <Tabs defaultValue={entries[0]?.[0]} className="h-full">
      <TabsList className="mb-2 flex-wrap h-auto">
        {entries.map(([path]) => (
          <TabsTrigger key={path} value={path} className="max-w-[140px] truncate">
            {path.split("/").pop()}
          </TabsTrigger>
        ))}
      </TabsList>
      {entries.map(([path, content]) => (
        <TabsContent key={path} value={path} className="m-0">
          <p className="mb-1 truncate text-xs text-slate-500">{path}</p>
          <ScrollArea className="h-[320px] rounded-lg border border-slate-700 bg-slate-950">
            <pre className="p-3 text-xs leading-relaxed text-slate-300">{content}</pre>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
}
