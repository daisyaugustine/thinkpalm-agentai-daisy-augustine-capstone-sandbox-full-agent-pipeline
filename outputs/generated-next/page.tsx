import { Section1VoyageOperations } from "./components/Section1VoyageOperations";
import { Section2FuelOperations } from "./components/Section2FuelOperations";
import { Section3CrewOperations } from "./components/Section3CrewOperations";
import { Section4AlertsOperations } from "./components/Section4AlertsOperations";
import { Section5ComplianceOperations } from "./components/Section5ComplianceOperations";
import { Section6WeatherOperations } from "./components/Section6WeatherOperations";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
          <p className="text-xs uppercase tracking-wide text-slate-300">BridgeView AI</p>
          <h1 className="mt-2 text-3xl font-bold">Maritime Product UI Preview</h1>
          <p className="mt-2 text-sm text-slate-200">
            Generated from requirement spec using multi-agent pipeline, memory, and tool-calling.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
        <Section1VoyageOperations />
        <Section2FuelOperations />
        <Section3CrewOperations />
        <Section4AlertsOperations />
        <Section5ComplianceOperations />
        <Section6WeatherOperations />
        </div>
      </div>
    </main>
  );
}
