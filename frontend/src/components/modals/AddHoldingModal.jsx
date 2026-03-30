import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FUNDS, addPortfolioHolding } from "../../lib/api.js";

/**
 * Modal to add a portfolio holding (fund + principal + horizon).
 * @param {{ open: boolean, onClose: () => void, onAdded: (summary: object) => void }} props
 */
export default function AddHoldingModal({ open, onClose, onAdded }) {
  const [ticker, setTicker] = useState(FUNDS[0]?.ticker ?? "");
  const [principal, setPrincipal] = useState(10000);
  const [years, setYears] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const summary = await addPortfolioHolding({ ticker, principal, years });
      onAdded(summary);
      onClose();
    } catch (err) {
      setError(err?.message ?? "Could not add holding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-holding-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 id="add-holding-title" className="font-instrument text-xl text-[var(--text-primary)]">
            Add holding
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-holding-fund" className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">
              MUTUAL FUND
            </label>
            <select
              id="add-holding-fund"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-inter text-sm text-[var(--text-primary)] outline-none"
            >
              {FUNDS.map((f) => (
                <option key={f.ticker} value={f.ticker}>
                  {f.ticker} — {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-holding-principal" className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">
              PRINCIPAL ($)
            </label>
            <input
              id="add-holding-principal"
              type="number"
              min={1}
              step={1}
              inputMode="decimal"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
              className="h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-holding-years" className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">
              TIME HORIZON (YEARS)
            </label>
            <input
              id="add-holding-years"
              type="number"
              min={1}
              max={50}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
              className="h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
            />
          </div>

          {error && (
            <p className="font-inter text-sm text-[var(--error)]" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-[var(--border-default)] font-inter text-sm font-medium text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-[var(--gs-gold)] font-inter text-sm font-semibold text-[var(--bg-page)] disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add to portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
