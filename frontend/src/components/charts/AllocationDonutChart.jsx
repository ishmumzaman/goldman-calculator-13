/**
 * Allocation donut chart for Portfolio page.
 * Uses a conic-gradient CSS approach; swap for Recharts PieChart if desired.
 *
 * @param {{ holdings: Array<{ ticker: string, principal: number, color: string }>, totalLabel: string }} props
 */
export default function AllocationDonutChart({ holdings = [], totalLabel = "$0" }) {
  const total = holdings.reduce((s, h) => s + h.principal, 0) || 1;

  // Build conic gradient segments
  let acc = 0;
  const segments = holdings.map((h) => {
    const start = acc;
    const pct = (h.principal / total) * 100;
    acc += pct;
    return `${h.color} ${start}% ${acc}%`;
  });

  // Fallback gradient in case segments are empty or invalid
  const gradient =
    segments.length > 0
      ? `conic-gradient(${segments.join(", ")})`
      : "conic-gradient(var(--gs-gold) 0% 25%, var(--gs-blue) 25% 50%, var(--success) 50% 75%, var(--orange-light) 75% 100%)";

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Donut */}
      <div className="relative w-[180px] h-[0px]">
        <div
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        {/* Inner hole */}
        <div className="absolute inset-[28px] rounded-full bg-[var(--bg-card)] flex flex-col items-center justify-center">
          <span className="font-inter text-lg font-bold text-[var(--text-primary)]">{totalLabel}</span>
          <span className="font-inter text-[11px] text-[var(--text-muted)]">Total Value</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 w-full">
        {holdings.map((h) => (
          <div key={h.ticker} className="flex items-center gap-2.5 w-full">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
            <span className="font-inter text-xs text-[var(--text-secondary)] flex-1">{h.ticker}</span>
            <span className="font-inter text-xs font-semibold text-[var(--text-primary)]">
              {Math.round((h.principal / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
