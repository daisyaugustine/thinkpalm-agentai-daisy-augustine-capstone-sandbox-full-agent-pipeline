import { z } from "zod";
import { grokStructuredOutput, isGrokEnabled } from "@/lib/grok";
import {
  RequirementsAnalysisSchema,
  type RequirementsAnalysis,
} from "@/types/pipeline";

const MARITIME_KEYWORDS = [
  "voyage tracking",
  "fuel monitoring",
  "crew certification",
  "weather alerts",
  "maintenance schedules",
  "cargo monitoring",
  "fleet overview",
  "compliance panel",
  "collision alerts",
  "bunker analytics",
];

function inferProductName(requirement: string): string {
  const lower = requirement.toLowerCase();
  if (lower.includes("vessel monitoring")) return "Vessel Monitoring System";
  if (lower.includes("crew welfare")) return "Crew Welfare Portal";
  if (lower.includes("fleet management")) return "Fleet Management Dashboard";
  if (lower.includes("cargo")) return "Cargo Monitoring Platform";
  return "Maritime Operations Dashboard";
}

function fallbackExtraction(requirement: string): RequirementsAnalysis {
  const lower = requirement.toLowerCase();
  const features = MARITIME_KEYWORDS.filter((kw) => {
    const token = kw.split(" ")[0];
    return lower.includes(token) || lower.includes(kw.replace(" ", ""));
  });
  const selected = features.length ? features : MARITIME_KEYWORDS.slice(0, 5);

  const entities: string[] = [];
  if (lower.includes("vessel")) entities.push("Vessel");
  if (lower.includes("crew")) entities.push("Crew");
  if (lower.includes("cargo")) entities.push("Cargo");
  if (lower.includes("fleet")) entities.push("Fleet");

  return RequirementsAnalysisSchema.parse({
    product_name: inferProductName(requirement),
    features: selected,
    domain_entities: entities.length ? entities : ["Vessel", "Voyage", "Crew"],
    dashboard_widgets: selected.map((f) =>
      f
        .split(" ")
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(""),
    ),
  });
}

const FeatureExtractionSchema = z.object({
  product_name: z.string(),
  features: z.array(z.string()),
  domain_entities: z.array(z.string()),
  dashboard_widgets: z.array(z.string()),
});

export async function extractFeatures(requirement: string): Promise<RequirementsAnalysis> {
  if (!isGrokEnabled()) {
    return fallbackExtraction(requirement);
  }

  try {
    const result = await grokStructuredOutput(
      FeatureExtractionSchema,
      `You are a maritime requirements analyst. Extract structured data from this PRD.
Return product_name, features (business capabilities), domain_entities, and dashboard_widgets (PascalCase component names).

PRD:
${requirement}`,
    );
    return RequirementsAnalysisSchema.parse(result);
  } catch {
    return fallbackExtraction(requirement);
  }
}
