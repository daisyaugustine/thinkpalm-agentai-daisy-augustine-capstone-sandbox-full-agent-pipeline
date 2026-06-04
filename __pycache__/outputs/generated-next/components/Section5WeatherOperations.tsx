export function Section5WeatherOperations() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Weather Operations</h3>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Live</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-lg bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">WeatherRiskTile</span>
        <span className="rounded-lg bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">StormRouteWarning</span>
      </div>
    </section>
  );
}
