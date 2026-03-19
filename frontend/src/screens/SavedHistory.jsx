import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import HistoryTable from "../components/tables/HistoryTable.jsx";
import { fetchHistory } from "../lib/api.js";

/**
 * Saved History screen – shows prior calculation runs stored locally.
 * @param {{ onViewResult?: (item) => void }} props
 */
export default function SavedHistory({ onViewResult }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHistory().then((data) => {
      if (!cancelled) {
        setItems(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-8 flex-1 overflow-auto px-12 py-8">
      <PageHeader
        title="Saved History"
        subtitle="Review and revisit your previous mutual fund calculations stored locally."
      />

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <span className="font-inter text-sm text-[var(--text-muted)] animate-pulse">
            Loading saved calculations…
          </span>
        </div>
      ) : items.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center gap-4 flex-1 p-8 rounded-xl bg-[var(--bg-recessed)] border border-[var(--border-subtle)]">
          <Clock3 size={48} className="text-[var(--text-disabled)] opacity-50" />
          <span className="font-inter text-lg font-semibold text-[var(--text-secondary)]">
            No Saved Calculations
          </span>
          <span className="font-inter text-sm text-[var(--text-tertiary)] text-center max-w-[400px] leading-relaxed">
            Your calculation history will appear here once you run your first
            mutual fund projection using the Calculator.
          </span>
          <button
            onClick={() => onViewResult?.({ _navigateToCalc: true })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--orange-primary)] font-inter text-sm font-semibold text-white"
          >
            Go to Calculator
          </button>
        </div>
      ) : (
        <HistoryTable items={items} onViewResult={onViewResult} />
      )}
    </div>
  );
}
