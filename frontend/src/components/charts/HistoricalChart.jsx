/**
 * Historical fund performance line chart skeleton.
 * TODO: Replace with Recharts <AreaChart> or Chart.js line chart.
 *
 * @param {{ data: Array<{month: number, value: number}>, title?: string, loading?: boolean, unavailable?: boolean }} props
 */
export default function HistoricalChart({ data = [], title = "Historical Fund Performance", loading = false, unavailable = false }) {
  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] min-h-[250px]">
        <span className="font-inter text-sm font-medium text-[var(--text-muted)]">Historical data unavailable for this fund</span>
        <span className="font-inter text-xs text-[var(--text-disabled)]">Try selecting a different mutual fund</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-h-[250px]">
        <span className="font-inter text-sm text-[var(--text-muted)] animate-pulse">Loading historical data…</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex flex-col gap-5 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">{title}</span>

      {/* TODO: Replace with <AreaChart> from Recharts */}
      <div className="flex items-end gap-px flex-1 min-h-[180px]">
        {data.map((pt, i) => (
          <div
            key={i}
            className="flex-1 bg-[var(--gs-blue)] opacity-60 rounded-t-sm min-h-[2px] transition-all"
            style={{ height: `${(pt.value / maxVal) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
