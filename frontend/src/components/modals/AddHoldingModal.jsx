import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { addPortfolioHolding, fetchFunds } from "../../lib/api.js";

/**
 * Modal to add a portfolio holding (fund + principal + horizon).
 * @param {{ open: boolean, onClose: () => void, onAdded: (summary: object) => void }} props
 */
export default function AddHoldingModal({ open, onClose, onAdded }) {
  const [funds, setFunds] = useState([]);
  const [ticker, setTicker] = useState("");
  const [principal, setPrincipal] = useState(10000);
  const [years, setYears] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setError(null);

    fetchFunds()
      .then((items) => {
        if (cancelled) return;
        setFunds(items);
        setTicker((current) => current || items[0]?.ticker || "");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "Could not load funds");
        }
      });

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
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
              onChange={(event) => setTicker(event.target.value)}
              disabled={!funds.length}
              className="h-11 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-inter text-sm text-[var(--text-primary)] outline-none disabled:opacity-50"
            >
              {funds.map((fund) => (
                <option key={fund.ticker} value={fund.ticker}>
                  {fund.ticker} - {fund.name}
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
              onChange={(event) => setPrincipal(Number(event.target.value) || 0)}
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
              onChange={(event) => setYears(Number(event.target.value) || 1)}
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
              disabled={submitting || !ticker}
              className="px-5 py-2.5 rounded-lg bg-[var(--gs-gold)] font-inter text-sm font-semibold text-[var(--bg-page)] disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add to portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
