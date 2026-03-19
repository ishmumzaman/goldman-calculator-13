/**
 * Projected growth bar chart skeleton.
 * TODO: Replace placeholder bars with Recharts <BarChart> or Chart.js bar chart.
 *
 * @param {{ yearlyValues: number[], years: number, title?: string }} props
 */
export default function ProjectionChart({ yearlyValues = [], years = 5, title = "Growth Projection" }) {
  const maxVal = Math.max(...yearlyValues, 1);

  return (
    <div className="flex flex-col gap-5 flex-1 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">{title}</span>
        <span className="font-dm-mono text-xs text-[var(--text-disabled)]">FV = P × (1 + r)ᵗ</span>
      </div>

      {/* TODO: Replace with <BarChart> from Recharts */}
      <div className="flex items-end gap-4 flex-1 min-h-[200px]">
        {yearlyValues.map((val, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 flex-1 justify-end h-full">
            <div
              className="w-full rounded-t bg-[var(--gs-gold)] min-h-[4px] transition-all"
              style={{ height: `${(val / maxVal) * 100}%` }}
            />
            <span className="font-inter text-[10px] text-[var(--text-muted)]">Yr {i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
