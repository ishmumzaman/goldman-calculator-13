import { TriangleAlert } from "lucide-react";

/**
 * Disclaimer / estimate warning banner.
 * @param {{ text: string }} props
 */
export default function DisclaimerBanner({ text }) {
  return (
    <div className="flex items-center gap-2 w-full px-4 py-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <TriangleAlert size={16} className="shrink-0 text-[var(--orange-primary)]" />
      <span className="font-inter text-xs text-[var(--text-muted)]">{text}</span>
    </div>
  );
}
