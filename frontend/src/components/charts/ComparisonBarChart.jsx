/**
 * Grouped bar chart comparing 2-3 funds over years.
 * TODO: Replace with Recharts grouped <BarChart>.
 *
 * @param {{ funds: Array<{ ticker: string, color: string, yearlyValues: number[] }>, years: number }} props
 */
const FUND_COLORS = ["var(--gs-gold)", "var(--gs-blue)", "var(--success)"];

export default function ComparisonBarChart({ funds = [], years = 5 }) {
  const allValues = funds.flatMap((f) => f.yearlyValues ?? []);
  const maxVal = Math.max(...allValues, 1);

  // Build year groups
  const yearGroups = Array.from({ length: years + 1 }, (_, yr) => ({
    year: yr,
    bars: funds.map((f, fi) => ({
      ticker: f.ticker,
      value: f.yearlyValues?.[yr] ?? 0,
      color: f.color || FUND_COLORS[fi] || FUND_COLORS[0],
    })),
  }));

  return (
    <div className="flex flex-col gap-5 w-full min-w-0 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">
          Projected Growth ({years} Year)
        </span>
        <span className="font-dm-mono text-xs text-[var(--text-disabled)]">FV = P × (1 + r)ᵗ</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5">
        {funds.map((f, i) => (
          <div key={f.ticker} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color || FUND_COLORS[i] }} />
            <span className="font-inter text-[11px] text-[var(--text-tertiary)]">{f.ticker}</span>
          </div>
        ))}
      </div>

      {/* TODO: Replace with <BarChart> from Recharts */}
      <div className="flex items-end gap-4 w-full h-[240px] shrink-0">
        {yearGroups.map((grp) => (
          <div key={grp.year} className="flex flex-col items-center gap-1.5 flex-1 justify-end min-h-0 h-full">
            <div className="flex items-end gap-1 w-full flex-1 min-h-0">
              {grp.bars.map((bar) => (
                <div
                  key={bar.ticker}
                  className="flex-1 rounded-t min-h-[4px] transition-all"
                  style={{ height: `${(bar.value / maxVal) * 100}%`, backgroundColor: bar.color }}
                />
              ))}
            </div>
            <span className="font-inter text-[10px] text-[var(--text-muted)]">Yr {grp.year}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
