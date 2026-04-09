import { useCallback, useEffect, useMemo, useState } from "react";
import { X, BarChart3 } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import RiskFreeBadge from "../components/ui/RiskFreeBadge.jsx";
import DisclaimerBanner from "../components/ui/DisclaimerBanner.jsx";
import FundSummaryCard from "../components/cards/FundSummaryCard.jsx";
import ComparisonBarChart from "../components/charts/ComparisonBarChart.jsx";
import { fetchFunds, fetchComparison } from "../lib/api.js";

const FUND_COLORS = ["var(--gs-gold)", "var(--gs-blue)", "var(--success)"];

function pickScenario(result, scenario) {
  return result.scenarios.find((item) => item.scenario === scenario)
    ?? result.scenarios.find((item) => item.scenario === "base")
    ?? { scenario: "base", rate: result.projectedRate, futureValue: result.futureValue };
}

export default function CompareFunds() {
  const [funds, setFunds] = useState([]);
  const [selected, setSelected] = useState(["VFIAX", "FXAIX"]);
  const [principal, setPrincipal] = useState(50000);
  const [years, setYears] = useState(10);
  const [scenario, setScenario] = useState("base");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchFunds()
      .then((items) => {
        if (cancelled) return;
        setFunds(items);
        if (items.length >= 2) {
          setSelected((current) => {
            const available = current.filter((ticker) => items.some((fund) => fund.ticker === ticker));
            if (available.length >= 2) return available.slice(0, 3);
            return items.slice(0, Math.min(2, items.length)).map((fund) => fund.ticker);
          });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message ?? "Could not load funds");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCompare = useCallback(async () => {
    if (selected.length < 2) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchComparison({ tickers: selected, principal, years });
      setResults(data);
    } catch (err) {
      setError(err?.message ?? "Comparison failed");
    } finally {
      setLoading(false);
    }
  }, [principal, selected, years]);

  useEffect(() => {
    if (selected.length >= 2 && results == null) {
      void handleCompare();
    }
  }, [handleCompare, results, selected.length]);

  const toggleFund = (ticker) => {
    setSelected((current) => {
      if (current.includes(ticker)) {
        return current.filter((item) => item !== ticker);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, ticker];
    });
  };

  const chartFunds = useMemo(
    () => (results || []).map((result, index) => {
      const activeScenario = pickScenario(result, scenario);
      return {
        ticker: result.fund.ticker,
        color: FUND_COLORS[index],
        yearlyValues: Array.from(
          { length: years + 1 },
          (_, year) => principal * Math.pow(1 + activeScenario.rate, year),
        ),
      };
    }),
    [principal, results, scenario, years],
  );

  const fmtMoney = (value) =>
    "$" + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (value) => `${(Number(value) * 100).toFixed(2)}%`;

  return (
    <div className="flex flex-col gap-7 flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-12 py-8 pb-10">
      <PageHeader title="Compare Funds" subtitle="Side-by-side CAPM projections for up to 3 mutual funds">
        <RiskFreeBadge />
      </PageHeader>

      <div className="flex items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">INVESTMENT</label>
          <input
            type="number"
            value={principal}
            onChange={(event) => setPrincipal(Number(event.target.value) || 0)}
            className="h-11 w-40 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">TIME HORIZON</label>
          <input
            type="number"
            value={years}
            onChange={(event) => setYears(Number(event.target.value) || 1)}
            min={1}
            max={50}
            className="h-11 w-28 px-3.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] font-dm-mono text-sm text-[var(--text-primary)] outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">SCENARIO</label>
          <div className="flex items-center h-11 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] overflow-hidden">
            {["conservative", "base", "optimistic"].map((value) => (
              <button
                key={value}
                onClick={() => setScenario(value)}
                className={`px-4 h-full font-inter text-xs font-medium capitalize transition-colors ${
                  scenario === value
                    ? "bg-[var(--gs-gold)] text-[var(--bg-page)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {value}
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
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-[var(--orange-tint)] border border-[var(--orange-primary)]/25">
          <span className="font-inter text-sm text-[var(--orange-primary)]">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <span className="font-inter text-xs font-semibold tracking-wide text-[var(--text-muted)]">SELECT FUNDS (2-3)</span>
        <div className="flex items-center gap-2.5 flex-wrap">
          {funds.map((fund) => {
            const isSelected = selected.includes(fund.ticker);
            const colorIndex = selected.indexOf(fund.ticker);
            return (
              <button
                key={fund.ticker}
                onClick={() => toggleFund(fund.ticker)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border font-inter text-[13px] font-medium transition-colors ${
                  isSelected
                    ? "border-[var(--gs-gold)] bg-[var(--gs-gold-tint)] text-[var(--gs-gold)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                }`}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FUND_COLORS[colorIndex] }} />
                )}
                <span className="font-dm-mono text-xs">{fund.ticker}</span>
                <span>{fund.name}</span>
                {isSelected && <X size={14} className="ml-1 opacity-60" />}
              </button>
            );
          })}
        </div>
      </div>

      {results && results.length >= 2 && (
        <div className="flex flex-col gap-8 w-full min-w-0 shrink-0">
          <div className="flex flex-col xl:flex-row xl:items-start gap-6 w-full min-w-0">
            <div className="w-full min-w-0 xl:flex-1 xl:min-w-0">
              <ComparisonBarChart funds={chartFunds} years={years} />
            </div>
            <div className="flex flex-col gap-4 w-full xl:w-[min(100%,320px)] xl:shrink-0">
              {results.map((result, index) => {
                const activeScenario = pickScenario(result, scenario);
                return (
                  <FundSummaryCard
                    key={result.fund.ticker}
                    ticker={result.fund.ticker}
                    name={result.fund.name}
                    category={result.fund.category}
                    futureValue={fmtMoney(activeScenario.futureValue)}
                    beta={result.beta.toFixed(2)}
                    projRate={fmtPct(activeScenario.rate)}
                    expReturn={fmtPct(result.expectedReturn)}
                    color={FUND_COLORS[index]}
                  />
                );
              })}
            </div>
          </div>

          <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
            <div className="flex flex-col min-w-[520px]">
              <div className="flex items-center h-12 px-5 bg-[var(--bg-elevated)]">
                <span className="flex-1 font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">METRIC</span>
                {results.map((result, index) => (
                  <span key={result.fund.ticker} className="flex-1 font-inter text-[11px] font-semibold tracking-wide" style={{ color: FUND_COLORS[index] }}>
                    {result.fund.ticker}
                  </span>
                ))}
              </div>
              {[
                { label: "Future Value", fn: (result) => fmtMoney(pickScenario(result, scenario).futureValue) },
                { label: "Scenario Rate", fn: (result) => fmtPct(pickScenario(result, scenario).rate) },
                { label: "Beta", fn: (result) => result.beta.toFixed(2) },
                { label: "Expected Return", fn: (result) => fmtPct(result.expectedReturn) },
                { label: "Risk-Free Rate", fn: (result) => fmtPct(result.riskFreeRate) },
                { label: "Category", fn: (result) => result.fund.category },
              ].map((row) => (
                <div key={row.label} className="flex items-center h-12 px-5 border-t border-[var(--border-subtle)]">
                  <span className="flex-1 font-inter text-[13px] text-[var(--text-muted)]">{row.label}</span>
                  {results.map((result) => (
                    <span key={`${result.fund.ticker}-${row.label}`} className="flex-1 font-dm-mono text-[13px] text-[var(--text-primary)]">
                      {row.fn(result)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(!results || results.length < 2) && !loading && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
          <BarChart3 size={40} className="text-[var(--text-disabled)]" />
          <span className="font-inter text-sm text-[var(--text-muted)]">
            Select at least 2 funds and click Compare to see results
          </span>
        </div>
      )}

      <DisclaimerBanner text="Comparisons are based on backend CAPM projections and do not account for fees, taxes, or future market regime changes." />
    </div>
  );
}
