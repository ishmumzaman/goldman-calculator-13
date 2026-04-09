/**
 * Scenario card (Conservative / Base / Optimistic) used on Results page.
 * @param {{ label: string, rate: string, futureValue: string, accentColor: string, active?: boolean }} props
 */
export default function ScenarioCard({ label, rate, futureValue, accentColor, active = false }) {
  return (
    <div
      className={`flex flex-col gap-3 flex-1 rounded-xl bg-[var(--bg-card)] border overflow-hidden
        ${active ? "border-[var(--gs-gold)]" : "border-[var(--border-subtle)]"}`}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="flex flex-col gap-3 px-5 pb-5">
        <span className="font-inter text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">{label}</span>
        <span className="font-dm-mono text-2xl font-semibold text-[var(--text-primary)]">{futureValue}</span>
        <span className="font-dm-mono text-sm" style={{ color: accentColor }}>{rate}</span>
      </div>
    </div>
  );
}
