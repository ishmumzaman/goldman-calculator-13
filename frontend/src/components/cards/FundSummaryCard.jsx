/**
 * Fund summary card used on Compare Funds page (color-bordered).
 * @param {{ ticker: string, name: string, category: string, futureValue: string, beta: string, projRate: string, expReturn: string, color: string }} props
 */
export default function FundSummaryCard({ ticker, name, category, futureValue, beta, projRate, expReturn, color }) {
  return (
    <div className="flex flex-col gap-3.5 p-4 rounded-xl bg-[var(--bg-card)] border" style={{ borderColor: color }}>
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <div className="flex flex-col gap-0.5">
            <span className="font-dm-mono text-[13px] font-semibold text-[var(--text-primary)]">{ticker}</span>
            <span className="font-inter text-[10px] text-[var(--text-muted)]">{name}</span>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium font-inter" style={{ backgroundColor: color + "18", color }}>
          {category}
        </span>
      </div>
      {/* Divider */}
      <div className="h-px bg-[var(--border-subtle)]" />
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-y-3">
        <Metric label="FUTURE VALUE" value={futureValue} color={color} />
        <Metric label="BETA" value={beta} color="var(--orange-primary)" />
        <Metric label="PROJ. RATE" value={projRate} color={color} />
        <Metric label="EXP. RETURN" value={expReturn} color="var(--text-primary)" />
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-inter text-[9px] font-semibold tracking-wide text-[var(--text-muted)]">{label}</span>
      <span className="font-dm-mono text-lg font-medium" style={{ color }}>{value}</span>
    </div>
  );
}
