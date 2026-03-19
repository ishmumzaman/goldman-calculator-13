import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Saved History sortable table with search/filter bar.
 * @param {{ items: Array, onViewResult?: (item)=>void }} props
 */
export default function HistoryTable({ items = [], onViewResult }) {
  const fmtMoney = (n) => "$" + Number(n).toLocaleString();

  return (
    <div className="flex flex-col gap-0 flex-1">
      {/* Search & filter bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2.5 flex-1 h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
          <Search size={16} className="text-[var(--text-muted)]" />
          <input
            placeholder="Search by fund name, period, or value…"
            className="bg-transparent flex-1 text-sm font-inter text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </div>
        <button className="flex items-center gap-2 h-11 px-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)]">
          <SlidersHorizontal size={14} />
          <span className="font-inter text-sm">Filters</span>
        </button>
        <button className="flex items-center gap-2 h-11 px-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-muted)]">
          <ArrowUpDown size={14} />
          <span className="font-inter text-sm">Sort by Date</span>
        </button>
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Head */}
        <div className="flex items-center h-12 px-5 bg-[var(--bg-elevated)]">
          {["Fund Name", "Principal", "Years", "Conservative", "Base", "Optimistic", "Date", "Action"].map((col) => (
            <span key={col} className={`font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)] ${col === "Action" ? "w-28 text-right" : "flex-1"}`}>
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        {items.map((item) => (
          <div key={item.id} className="flex items-center h-14 px-5 border-t border-[var(--border-subtle)]">
            <span className="flex-1 font-inter text-[13px] font-medium text-[var(--text-primary)]">{item.fundName}</span>
            <span className="flex-1 font-dm-mono text-[13px] text-[var(--text-secondary)]">{fmtMoney(item.principal)}</span>
            <span className="flex-1 font-inter text-[13px] text-[var(--text-secondary)]">{item.years}</span>
            <span className="flex-1 font-dm-mono text-[13px] text-[var(--orange-primary)]">{fmtMoney(item.conservative)}</span>
            <span className="flex-1 font-dm-mono text-[13px] text-[var(--success)]">{fmtMoney(item.base)}</span>
            <span className="flex-1 font-dm-mono text-[13px] text-[var(--gs-blue)]">{fmtMoney(item.optimistic)}</span>
            <span className="flex-1 font-inter text-[13px] text-[var(--text-muted)]">{item.date}</span>
            <div className="w-28 flex justify-end">
              <button
                onClick={() => onViewResult?.(item)}
                className="px-3 py-1.5 rounded-md bg-[var(--gs-gold-tint)] font-inter text-xs font-medium text-[var(--gs-gold)] hover:bg-[var(--gs-gold)]/20 transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        ))}

        {/* Footer / pagination */}
        <div className="flex items-center justify-between h-12 px-5 border-t border-[var(--border-subtle)]">
          <span className="font-inter text-xs text-[var(--text-muted)]">
            Showing 1-{items.length} of {items.length} calculations
          </span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded border border-[var(--border-default)] text-[var(--text-muted)]">
              <ChevronLeft size={14} />
            </button>
            <button className="p-1.5 rounded border border-[var(--border-default)] text-[var(--text-muted)]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
