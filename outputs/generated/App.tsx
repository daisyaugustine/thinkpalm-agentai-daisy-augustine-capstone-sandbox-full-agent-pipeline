import React from "react";
import { VoyageOperationsSection } from "./components/VoyageOperationsSection";
import { FuelOperationsSection } from "./components/FuelOperationsSection";
import { CrewOperationsSection } from "./components/CrewOperationsSection";
import { AlertsOperationsSection } from "./components/AlertsOperationsSection";
import { ComplianceOperationsSection } from "./components/ComplianceOperationsSection";
import { WeatherOperationsSection } from "./components/WeatherOperationsSection";


export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">BridgeView AI Dashboard</h1>
        <p className="text-slate-300 mb-6">Generated from maritime requirements.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VoyageOperationsSection />
          <FuelOperationsSection />
          <CrewOperationsSection />
          <AlertsOperationsSection />
          <ComplianceOperationsSection />
          <WeatherOperationsSection />
        </div>
      </div>
    </main>
  );
}
