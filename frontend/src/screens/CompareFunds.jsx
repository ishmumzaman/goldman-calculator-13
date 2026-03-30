import { useEffect, useState } from "react";
import { Plus, X, BarChart3 } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import RiskFreeBadge from "../components/ui/RiskFreeBadge.jsx";
import DisclaimerBanner from "../components/ui/DisclaimerBanner.jsx";
import FundSummaryCard from "../components/cards/FundSummaryCard.jsx";
import ComparisonBarChart from "../components/charts/ComparisonBarChart.jsx";
import { fetchFunds, fetchComparison, FUNDS } from "../lib/api.js";

const FUND_COLORS = ["var(--gs-gold)", "var(--gs-blue)", "var(--success)"];

export default function CompareFunds() {
  const [funds, setFunds] = useState([]);
  const [selected, setSelected] = useState(["VFIAX", "FXAIX"]);
  const [principal, setPrincipal] = useState(50000);
  const [years, setYears] = useState(10);
  const [scenario, setScenario] = useState("base");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFunds().then(setFunds);
  }, []);

  // Auto-compare on mount and when selection changes
  useEffect(() => {
    if (selected.length >= 2) handleCompare();
  }, []);

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    const data = await fetchComparison({ tickers: selected, principal, years });
    setResults(data);
    setLoading(false);
  };

  const toggleFund = (ticker) => {
    setSelected((prev) => {
      if (prev.includes(ticker)) return prev.filter((t) => t !== ticker);
      if (prev.length >= 3) return prev;
      return [...prev, ticker];
    });
  };

  const fmtMoney = (n) => "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n) => `${(n * 100).toFixed(2)}%`;

  const chartFunds = (results || []).map((r, i) => ({
    ticker: r.fund.ticker,
    color: FUND_COLORS[i],
    yearlyValues: Array.from({ length: years + 1 }, (_, yr) => principal * Math.pow(1 + r.projectedRate, yr)),
  }));

  return (
    <div className="flex flex-col gap-7 flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-12 py-8 pb-10">
      {/* Header */}
      <PageHeader title="Compare Funds" subtitle="Side-by-side CAPM projections for up to 3 mutual funds">
        <RiskFreeBadge />
      </PageHeader>

      {/* Control bar */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">INVESTMENT</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
            className="h-11 w-40 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">TIME HORIZON</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value) || 1)}
            min={1}
            max={50}
            className="h-11 w-28 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">SCENARIO</label>
          <div className="flex items-center h-11 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden">
            {["conservative", "base", "optimistic"].map((s) => (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className={`px-4 h-full font-inter text-xs font-medium capitalize transition-colors ${
                  scenario === s
                    ? "bg-[var(--gs-gold)] text-[var(--bg-page)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5 self-end">
          <button
            onClick={handleCompare}
            disabled={selected.length < 2 || loading}
            className="flex items-center gap-2 h-11 px-6 rounded-lg bg-[var(--gs-gold)] font-inter text-[13px] font-semibold text-[var(--bg-page)] disabled:opacity-40 transition-opacity"
          >
            <BarChart3 size={16} />
            {loading ? "Comparing…" : "Compare"}
          </button>
        </div>
      </div>

      {/* Fund selection chips */}
      <div className="flex flex-col gap-3">
        <span className="font-inter text-xs font-semibold tracking-wide text-[var(--text-muted)]">SELECT FUNDS (2–3)</span>
        <div className="flex items-center gap-2.5 flex-wrap">
          {funds.map((f) => {
            const isSelected = selected.includes(f.ticker);
            const idx = selected.indexOf(f.ticker);
            return (
              <button
                key={f.ticker}
                onClick={() => toggleFund(f.ticker)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-inter text-[13px] font-medium transition-colors ${
                  isSelected
                    ? "border-[var(--gs-gold)] bg-[var(--gs-gold-tint)] text-[var(--gs-gold)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FUND_COLORS[idx] }} />
                )}
                <span className="font-dm-mono text-xs">{f.ticker}</span>
                <span>{f.name}</span>
                {isSelected && <X size={14} className="ml-1 opacity-60" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {results && results.length >= 2 && (
        <div className="flex flex-col gap-8 w-full min-w-0 shrink-0">
          {/* Chart + fund cards: stack on small screens, side-by-side on large */}
          <div className="flex flex-col xl:flex-row xl:items-start gap-6 w-full min-w-0">
            <div className="w-full min-w-0 xl:flex-1 xl:min-w-0">
              <ComparisonBarChart funds={chartFunds} years={years} />
            </div>
            <div className="flex flex-col gap-4 w-full xl:w-[min(100%,320px)] xl:shrink-0">
              {results.map((r, i) => (
                <FundSummaryCard
                  key={r.fund.ticker}
                  ticker={r.fund.ticker}
                  name={r.fund.name}
                  category={r.fund.category}
                  futureValue={fmtMoney(r.futureValue)}
                  beta={r.fund.beta.toFixed(2)}
                  projRate={fmtPct(r.projectedRate)}
                  expReturn={fmtPct(r.fund.lastYearReturn)}
                  color={FUND_COLORS[i]}
                />
              ))}
            </div>
          </div>

          {/* Comparison table — full width below chart/cards, horizontal scroll on narrow viewports */}
          <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <div className="flex flex-col min-w-[520px]">
            <div className="flex items-center h-12 px-5 bg-[var(--bg-elevated)]">
              <span className="flex-1 font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">METRIC</span>
              {results.map((r, i) => (
                <span key={r.fund.ticker} className="flex-1 font-inter text-[11px] font-semibold tracking-wide" style={{ color: FUND_COLORS[i] }}>
                  {r.fund.ticker}
                </span>
              ))}
            </div>
            {[
              { label: "Future Value", fn: (r) => fmtMoney(r.futureValue) },
              { label: "CAPM Rate", fn: (r) => fmtPct(r.projectedRate) },
              { label: "Beta", fn: (r) => r.fund.beta.toFixed(2) },
              { label: "Expected Return", fn: (r) => fmtPct(r.fund.lastYearReturn) },
              { label: "Expense Ratio", fn: (r) => fmtPct(r.fund.expenseRatio) },
              { label: "Category", fn: (r) => r.fund.category },
            ].map((row) => (
              <div key={row.label} className="flex items-center h-12 px-5 border-t border-[var(--border-subtle)]">
                <span className="flex-1 font-inter text-[13px] text-[var(--text-muted)]">{row.label}</span>
                {results.map((r) => (
                  <span key={r.fund.ticker} className="flex-1 font-dm-mono text-[13px] text-[var(--text-primary)]">
                    {row.fn(r)}
                  </span>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!results || results.length < 2) && !loading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
          <BarChart3 size={40} className="text-[var(--text-disabled)]" />
          <span className="font-inter text-sm text-[var(--text-muted)]">
            Select at least 2 funds and click Compare to see results
          </span>
        </div>
      )}

      <DisclaimerBanner text="Comparisons are based on CAPM projections and do not account for fees, taxes, or market volatility. Past performance does not guarantee future results." />
    </div>
  );
}
