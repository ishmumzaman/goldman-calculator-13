import { useMemo, useState, useCallback } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

function parseHistoryDate(dateStr) {
  const t = Date.parse(String(dateStr));
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Saved History sortable table with search/filter bar.
 * @param {{ items: Array, onViewResult?: (item)=>void }} props
 */
export default function HistoryTable({ items = [], onViewResult }) {
  const fmtMoney = (n) => "$" + Number(n).toLocaleString();

  const [searchQuery, setSearchQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const filteredSorted = useMemo(() => {
    let list = [...items];

    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((i) => {
        const haystack = [
          i.fundName,
          i.ticker,
          String(i.principal),
          String(i.years),
          i.date,
          String(i.conservative),
          String(i.base),
          String(i.optimistic),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    list.sort((a, b) => {
      const ta = parseHistoryDate(a.date);
      const tb = parseHistoryDate(b.date);
      return sortNewestFirst ? tb - ta : ta - tb;
    });

    return list;
  }, [items, statusFilter, searchQuery, sortNewestFirst]);

  const toggleSort = useCallback(() => {
    setSortNewestFirst((prev) => !prev);
  }, []);

  const hasActiveFilters = statusFilter !== "all" || searchQuery.trim().length > 0;
  const totalCount = items.length;
  const shownCount = filteredSorted.length;

  return (
    <div className="flex flex-col gap-0 flex-1 min-w-0">
      {/* Search & filter bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-[200px] h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
            <Search size={16} className="shrink-0 text-[var(--text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by fund name, ticker, amount, years, or date…"
              className="bg-transparent flex-1 min-w-0 text-sm font-inter text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              aria-label="Search saved calculations"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 h-11 px-4 rounded-lg border font-inter text-sm shrink-0 transition-colors ${
              filtersOpen || statusFilter !== "all"
                ? "bg-[var(--gs-gold-tint)] border-[var(--gs-gold)] text-[var(--gs-gold)]"
                : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-muted)]"
            }`}
            aria-expanded={filtersOpen}
            aria-controls="history-filters-panel"
          >
            <SlidersHorizontal size={14} />
            Filters
            {statusFilter !== "all" && (
              <span className="sr-only">(active)</span>
            )}
          </button>
          <button
            type="button"
            onClick={toggleSort}
            className="flex items-center gap-2 h-11 px-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] font-inter text-sm shrink-0 hover:border-[var(--text-muted)] transition-colors"
            title={sortNewestFirst ? "Newest first" : "Oldest first"}
          >
            <ArrowUpDown size={14} className={sortNewestFirst ? "" : "rotate-180"} />
            {sortNewestFirst ? "Newest first" : "Oldest first"}
          </button>
        </div>

        {filtersOpen && (
          <div
            id="history-filters-panel"
            className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            role="region"
            aria-label="Filter saved calculations"
          >
            <span className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)] w-full sm:w-auto sm:mr-2">
              OUTCOME
            </span>
            {[
              { value: "all", label: "All" },
              { value: "gain", label: "Gain" },
              { value: "loss", label: "Loss" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`px-3.5 py-2 rounded-lg font-inter text-xs font-medium transition-colors ${
                  statusFilter === value
                    ? "bg-[var(--gs-gold)] text-[var(--bg-page)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:border-[var(--text-muted)]"
                }`}
              >
                {label}
              </button>
            ))}
            {statusFilter !== "all" && (
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className="ml-auto font-inter text-xs text-[var(--gs-blue)] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex flex-col flex-1 min-w-0 rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Head */}
        <div className="flex items-center h-12 px-5 bg-[var(--bg-elevated)] min-w-[720px]">
          {["Fund Name", "Principal", "Years", "Conservative", "Base", "Optimistic", "Date", "Action"].map((col) => (
            <span
              key={col}
              className={`font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)] ${col === "Action" ? "w-28 text-right shrink-0" : "flex-1 min-w-0"}`}
            >
              {col}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="overflow-x-auto">
          {filteredSorted.length === 0 ? (
            <div className="flex items-center justify-center min-h-[200px] px-5 py-8 border-t border-[var(--border-subtle)]">
              <span className="font-inter text-sm text-[var(--text-muted)] text-center">
                {hasActiveFilters
                  ? "No calculations match your search or filters."
                  : "No saved calculations yet."}
              </span>
            </div>
          ) : (
            filteredSorted.map((item) => (
              <div
                key={item.id}
                className="flex items-center min-h-14 px-5 py-2 border-t border-[var(--border-subtle)] min-w-[720px]"
              >
                <span className="flex-1 min-w-0 font-inter text-[13px] font-medium text-[var(--text-primary)] truncate pr-2">
                  {item.fundName}
                </span>
                <span className="flex-1 min-w-0 font-dm-mono text-[13px] text-[var(--text-secondary)]">{fmtMoney(item.principal)}</span>
                <span className="flex-1 min-w-0 font-inter text-[13px] text-[var(--text-secondary)]">{item.years}</span>
                <span className="flex-1 min-w-0 font-dm-mono text-[13px] text-[var(--orange-primary)]">{fmtMoney(item.conservative)}</span>
                <span className="flex-1 min-w-0 font-dm-mono text-[13px] text-[var(--success)]">{fmtMoney(item.base)}</span>
                <span className="flex-1 min-w-0 font-dm-mono text-[13px] text-[var(--gs-blue)]">{fmtMoney(item.optimistic)}</span>
                <span className="flex-1 min-w-0 font-inter text-[13px] text-[var(--text-muted)]">{item.date}</span>
                <div className="w-28 shrink-0 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onViewResult?.(item)}
                    className="px-3 py-1.5 rounded-md bg-[var(--gs-gold-tint)] font-inter text-xs font-medium text-[var(--gs-gold)] hover:bg-[var(--gs-gold)]/20 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 h-auto min-h-12 py-2 px-5 border-t border-[var(--border-subtle)]">
          <span className="font-inter text-xs text-[var(--text-muted)]">
            {shownCount === 0
              ? "No calculations to show"
              : hasActiveFilters
                ? `Showing ${shownCount} of ${totalCount} saved calculation${totalCount === 1 ? "" : "s"}`
                : `Showing ${shownCount} saved calculation${shownCount === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-2 opacity-40 pointer-events-none" aria-hidden="true">
            <button type="button" className="p-1.5 rounded border border-[var(--border-default)] text-[var(--text-muted)]" disabled>
              <ChevronLeft size={14} />
            </button>
            <button type="button" className="p-1.5 rounded border border-[var(--border-default)] text-[var(--text-muted)]" disabled>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
