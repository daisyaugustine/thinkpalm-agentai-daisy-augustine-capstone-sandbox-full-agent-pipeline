import { z } from "zod";
import { grokStructuredOutput, isGrokEnabled } from "@/lib/grok";
import type { ComponentHierarchy, RequirementsAnalysis, WidgetNode } from "@/types/pipeline";

const WidgetTypeSchema = z.enum(["section", "card", "metric", "alert", "header", "table"]);

const WidgetChildSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  description: z.string(),
});

const WidgetNodeSchema = z.object({
  id: z.string(),
  type: WidgetTypeSchema,
  title: z.string(),
  description: z.string(),
  children: z.array(WidgetChildSchema).optional(),
});

const ComponentTreeSchema = z.object({
  hierarchy: z.record(z.record(z.object({}))),
  widgetTree: z.array(WidgetNodeSchema),
});

function widgetType(name: string): WidgetNode["type"] {
  const lc = name.toLowerCase();
  if (lc.includes("header")) return "header";
  if (lc.includes("alert")) return "alert";
  if (lc.includes("table") || lc.includes("maintenance")) return "table";
  if (lc.includes("fuel") || lc.includes("gauge") || lc.includes("metric")) return "metric";
  if (lc.includes("card") || lc.includes("panel")) return "card";
  return "section";
}

export function buildComponentHierarchy(analysis: RequirementsAnalysis): ComponentHierarchy {
  const children: Record<string, Record<string, unknown>> = {
    Header: {},
  };

  const widgets =
    analysis.dashboard_widgets ??
    analysis.features.map((f) =>
      f
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(""),
    );

  for (const widget of widgets) {
    const key = widget.replace(/\s+/g, "");
    children[key.endsWith("Card") || key.endsWith("Panel") ? key : `${key}Card`] = {};
  }

  return { Dashboard: children };
}

export function hierarchyToWidgetTree(hierarchy: ComponentHierarchy): WidgetNode[] {
  const dashboard = hierarchy.Dashboard;
  if (!dashboard || typeof dashboard !== "object") {
    return [];
  }

  return Object.keys(dashboard).map((title, index) => {
    const type = widgetType(title);
    return {
      id: `widget-${index + 1}`,
      type,
      title,
      description: `Maritime UI component for ${title.replace(/([A-Z])/g, " $1").trim()}`,
      children:
        type === "section"
          ? [
              {
                id: `widget-${index + 1}-detail`,
                type: "card" as const,
                title: `${title} Details`,
                description: "Operational KPI and status indicators",
              },
            ]
          : undefined,
    };
  });
}

function fallbackComponentTree(analysis: RequirementsAnalysis): {
  hierarchy: ComponentHierarchy;
  widgetTree: WidgetNode[];
} {
  const hierarchy = buildComponentHierarchy(analysis);
  const widgetTree = hierarchyToWidgetTree(hierarchy);
  return { hierarchy, widgetTree };
}

export async function generateComponentTree(analysis: RequirementsAnalysis): Promise<{
  hierarchy: ComponentHierarchy;
  widgetTree: WidgetNode[];
}> {
  if (!isGrokEnabled()) {
    return fallbackComponentTree(analysis);
  }

  try {
    const result = await grokStructuredOutput(
      ComponentTreeSchema,
      `You are a maritime UI architect. Design a dashboard component hierarchy and widget tree for this product.

Product: ${analysis.product_name}
Features: ${analysis.features.join(", ")}
Domain entities: ${(analysis.domain_entities ?? []).join(", ") || "maritime operations"}
Suggested widgets: ${(analysis.dashboard_widgets ?? []).join(", ") || "derive from features"}

Rules:
- hierarchy must have a top-level "Dashboard" key mapping component names to nested objects (use {} for leaves).
- Include a Header component and one widget per major feature.
- widgetTree: id (widget-1, widget-2, …), type, title, description; add children only for section widgets.
- Use maritime-appropriate titles and descriptions.`,
    );

    const hierarchy = result.hierarchy as ComponentHierarchy;
    if (!hierarchy.Dashboard || typeof hierarchy.Dashboard !== "object") {
      return fallbackComponentTree(analysis);
    }

    return {
      hierarchy,
      widgetTree: result.widgetTree as WidgetNode[],
    };
  } catch {
    return fallbackComponentTree(analysis);
  }
}
