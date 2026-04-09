/**
 * Stat card used on Portfolio summary row and CAPM breakdown.
 * @param {{ label: string, value: string, sub?: string, subColor?: string, valueColor?: string }} props
 */
export default function StatCard({ label, value, sub, subColor = "var(--text-tertiary)", valueColor = "var(--text-primary)" }) {
  return (
    <div className="flex flex-col gap-2 flex-1 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
      <span className="font-inter text-xs font-medium tracking-wide text-[var(--text-muted)]">{label}</span>
      <span className="font-inter text-[28px] font-bold" style={{ color: valueColor }}>{value}</span>
      {sub && (
        <span className="font-inter text-xs font-medium" style={{ color: subColor }}>{sub}</span>
      )}
    </div>
  );
}
