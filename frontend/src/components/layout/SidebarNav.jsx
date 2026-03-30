import {
  Calculator, BarChart3, Clock3, Briefcase, Info,
} from "lucide-react";

const NAV_ITEMS = [
  { key: "calculator", label: "Calculator", icon: Calculator },
  { key: "compare", label: "Compare Funds", icon: BarChart3 },
  { key: "history", label: "Saved History", icon: Clock3 },
  { key: "portfolio", label: "Portfolio", icon: Briefcase },
];

export default function SidebarNav({ activeScreen, onNavigate }) {
  return (
    <aside className="flex flex-col justify-between w-[260px] min-w-[260px] h-full bg-[var(--bg-sidebar)] border-l-2 border-l-[var(--gs-gold)] px-6 py-5">
      {/* Top */}
      <div className="flex flex-col gap-8">
        {/* Logo — full content width, taller cap (no fixed intrinsic size) */}
        <div className="flex flex-col w-full min-w-0 self-stretch">
          <img
            src="/branding/goldman-sachs-logo.png"
            alt="Goldman Sachs"
            className="block w-full h-auto max-h-40 object-contain object-left"
            decoding="async"
          />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = activeScreen === key;
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`flex items-center gap-3 w-full rounded-lg px-3.5 py-3 text-sm font-inter transition-colors
                  ${active
                    ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium"
                    : "text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)]/40"
                  }`}
              >
                <Icon size={18} className={active ? "text-[var(--gs-gold)]" : "text-[var(--text-muted)]"} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-4">
        {/* CAPM info box */}
        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <Info size={18} className="text-[var(--gs-blue)]" />
          <span className="font-inter text-xs font-semibold text-[var(--text-primary)]">CAPM Model</span>
          <span className="font-dm-mono text-[11px] text-[var(--gs-blue)] leading-relaxed whitespace-pre-line">
            {"r = Rf + β(Rm − Rf)\nFV = P × (1 + r)ᵗ"}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--bg-border)]" />

        {/* User area */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--bg-border)]">
            <span className="font-inter text-xs font-semibold text-[var(--text-tertiary)]">JS</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-inter text-[13px] font-medium text-[var(--text-primary)]">Jane Smith</span>
            <span className="font-inter text-[11px] text-[var(--text-muted)]">Engineering Intern</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
