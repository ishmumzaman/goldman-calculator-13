/**
 * "10Y Treasury Rate: 4.25%" badge shown in headers.
 */
export default function RiskFreeBadge({ rate = "4.25%" }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-inter text-xs font-medium text-[var(--text-tertiary)]">10Y Treasury Rate:</span>
      <span className="px-2.5 py-1 rounded-full bg-[var(--gs-blue-tint)] font-dm-mono text-xs font-medium text-[var(--gs-blue)]">
        {rate}
      </span>
    </div>
  );
}
