import { Trash2, SlidersHorizontal } from "lucide-react";

const COLS = ["FUND", "PRINCIPAL", "HORIZON", "PROJ. RATE", "FUTURE VALUE", ""];

/**
 * Holdings table for Portfolio page.
 * @param {{ holdings: Array<{ id?: string, ticker: string }>, totalPrincipal: number, totalProjected: number, avgRate: number, onRemove?: (id: string)=>void }} props
 */
export default function HoldingsTable({ holdings = [], totalPrincipal = 0, totalProjected = 0, avgRate = 0, onRemove }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Holdings</span>
        <button type="button" className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-default)] text-[var(--text-muted)]">
          <SlidersHorizontal size={14} />
          <span className="font-inter text-xs">Filter</span>
        </button>
      </div>

      {/* Table head */}
      <div className="flex shrink-0 items-center px-6 py-3 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
        {COLS.map((col, i) => (
          <div key={col || "action"} className={i === COLS.length - 1 ? "w-20" : "flex-1"}>
            <span className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">{col}</span>
          </div>
        ))}
      </div>

      {/* Scrollable rows */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
        {holdings.length === 0 ? (
          <div className="flex items-center justify-center px-6 py-12">
            <span className="font-inter text-sm text-[var(--text-muted)]">No holdings yet. Add a fund to get started.</span>
          </div>
        ) : (
          holdings.map((h) => (
            <div key={h.id ?? h.ticker} className="flex items-center px-6 py-3.5 border-t border-[var(--border-subtle)]">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-inter text-[13px] font-semibold text-[var(--text-primary)]">{h.ticker}</span>
                <span className="font-inter text-[11px] text-[var(--text-muted)] truncate">{h.name}</span>
              </div>
              <span className="flex-1 font-inter text-[13px] font-medium text-[var(--text-primary)]">
                ${h.principal.toLocaleString()}
              </span>
              <span className="flex-1 font-inter text-[13px] text-[var(--text-secondary)]">{h.years} years</span>
              <span className="flex-1 font-inter text-[13px] font-semibold text-[var(--success)]">
                {(h.projRate * 100).toFixed(1)}%
              </span>
              <span className="flex-1 font-inter text-[13px] font-semibold text-[var(--text-primary)]">
                ${h.futureValue.toLocaleString()}
              </span>
              <div className="w-20 shrink-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => h.id && onRemove?.(h.id)}
                  className="text-[var(--text-muted)] hover:text-[var(--error)]"
                  aria-label={`Remove ${h.ticker}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer totals */}
      <div className="flex shrink-0 items-center px-6 py-3.5 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
        <span className="flex-1 font-inter text-[13px] font-bold tracking-wide text-[var(--text-primary)]">TOTAL</span>
        <span className="flex-1 font-inter text-[13px] font-bold text-[var(--text-primary)]">
          ${totalPrincipal.toLocaleString()}
        </span>
        <span className="flex-1 font-inter text-[13px] text-[var(--text-muted)]">—</span>
        <span className="flex-1 font-inter text-[13px] font-bold text-[var(--gs-gold)]">
          {(avgRate * 100).toFixed(1)}% avg
        </span>
        <span className="flex-1 font-inter text-[13px] font-bold text-[var(--gs-gold)]">
          ${totalProjected.toLocaleString()}
        </span>
        <div className="w-20" />
      </div>
    </div>
  );
}
