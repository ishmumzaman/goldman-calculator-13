import { useEffect, useState } from "react";
import { ArrowLeft, Download, Plus, TrendingUp, HelpCircle } from "lucide-react";
import StatCard from "../components/cards/StatCard.jsx";
import ScenarioCard from "../components/cards/ScenarioCard.jsx";
import ProjectionChart from "../components/charts/ProjectionChart.jsx";
import HistoricalChart from "../components/charts/HistoricalChart.jsx";
import DisclaimerBanner from "../components/ui/DisclaimerBanner.jsx";
import { fetchExplanation, fetchFundHistory } from "../lib/api.js";

/**
 * Investment Projection / Results screen.
 * @param {{ result: import("../lib/types.js").CalculationResult | null, onBack?: () => void }} props
 */
export default function InvestmentProjection({ result, onBack }) {
  const [explanation, setExplanation] = useState([]);
  const [histData, setHistData] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    if (!result?.fund?.ticker) return;
    fetchExplanation({ ticker: result.fund.ticker }).then(setExplanation);
    setHistLoading(true);
    fetchFundHistory(result.fund.ticker).then((d) => {
      setHistData(d);
      setHistLoading(false);
    });
  }, [result?.fund?.ticker]);

  if (!result) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center gap-3">
          <span className="font-inter text-sm text-[var(--text-muted)]">No calculation result available.</span>
          <button onClick={onBack} className="font-inter text-sm text-[var(--gs-gold)] underline">Go to Calculator</button>
        </div>
      </div>
    );
  }

  const { fund, principal, years, projectedRate, futureValue, riskFreeRate, beta, expectedReturn, scenarios, yearlyValues } = result;
  const fmtMoney = (n) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (n) => `${(n * 100).toFixed(2)}%`;
  const totalReturn = futureValue - principal;
  const totalReturnPct = ((totalReturn / principal) * 100).toFixed(1);

  const cons = scenarios.find((s) => s.scenario === "conservative");
  const base = scenarios.find((s) => s.scenario === "base");
  const opt = scenarios.find((s) => s.scenario === "optimistic");

  return (
    <div className="flex flex-col gap-7 flex-1 overflow-auto px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 font-inter text-xs text-[var(--gs-gold)] hover:underline mb-1">
            <ArrowLeft size={14} /> Back to Calculator
          </button>
          <h1 className="font-instrument text-[34px] tracking-tight text-[var(--text-primary)]">Investment Projection</h1>
          <p className="font-inter text-sm text-[var(--text-muted)]">
            {fund.name} ({fund.ticker}) · {years} Year Analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] font-inter text-[13px] font-medium text-[var(--text-secondary)]">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--gs-gold)] font-inter text-[13px] font-semibold text-[var(--bg-page)]">
            <Plus size={16} /> New Calculation
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="flex items-center justify-between p-7 rounded-xl bg-gradient-to-b from-[#1A1A1D] to-[#141417] border border-[var(--gs-gold)]">
        <div className="flex flex-col gap-2">
          <span className="font-inter text-xs font-semibold tracking-wide text-[var(--text-muted)]">PROJECTED FUTURE VALUE</span>
          <span className="font-dm-mono text-[42px] font-bold text-[var(--text-primary)]">{fmtMoney(futureValue)}</span>
          <span className="font-inter text-sm text-[var(--text-muted)]">
            From {fmtMoney(principal)} over investment · {fmtPct(projectedRate)}/year
          </span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1.5 rounded-md bg-[var(--success-tint)] font-inter text-sm font-semibold text-[var(--success)]">
            +{fmtMoney(totalReturn)} Total Return
          </span>
          <span className="font-inter text-xs text-[var(--text-muted)]">≈ +{totalReturnPct}% gain</span>
        </div>
      </div>

      {/* CAPM Breakdown row */}
      <div className="flex gap-4">
        <StatCard label="Risk-Free Rate (Rf)" value={fmtPct(riskFreeRate)} sub="10Y Treasury Yield" valueColor="var(--gs-blue)" />
        <StatCard label="Beta (β)" value={beta.toFixed(2)} sub="Fund Volatility Index" valueColor="var(--orange-primary)" />
        <StatCard label="Expected Return (Rm)" value={fmtPct(expectedReturn)} sub="Broad Market Consensus" valueColor="var(--success)" />
        <StatCard label="CAPM Rate (r)" value={fmtPct(projectedRate)} sub="Projected Annualized" valueColor="var(--gs-gold)" />
      </div>

      {/* Scenario Analysis */}
      <div className="flex flex-col gap-4">
        <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Scenario Analysis</span>
        <div className="flex gap-4">
          {cons && <ScenarioCard label="Conservative" rate={fmtPct(cons.rate)} futureValue={fmtMoney(cons.futureValue)} accentColor="var(--orange-primary)" />}
          {base && <ScenarioCard label="Base" rate={fmtPct(base.rate)} futureValue={fmtMoney(base.futureValue)} accentColor="var(--gs-gold)" active />}
          {opt && <ScenarioCard label="Optimistic" rate={fmtPct(opt.rate)} futureValue={fmtMoney(opt.futureValue)} accentColor="var(--success)" />}
        </div>
        {/* Spread bar */}
        {cons && opt && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <span className="font-dm-mono text-xs text-[var(--orange-primary)]">{fmtMoney(cons.futureValue)}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--orange-primary)] via-[var(--gs-gold)] to-[var(--success)] rounded-full" style={{ width: "100%" }} />
            </div>
            <span className="font-dm-mono text-xs text-[var(--success)]">{fmtMoney(opt.futureValue)}</span>
          </div>
        )}
      </div>

      {/* Explainability panel */}
      {explanation.length > 0 && (
        <div className="flex flex-col gap-4 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-[var(--gs-blue)]" />
            <span className="font-inter text-base font-semibold text-[var(--text-primary)]">How We Calculated This</span>
          </div>
          <div className="flex flex-col gap-4">
            {explanation.map((item, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <span className="font-inter text-sm font-semibold text-[var(--gs-gold)]">{item.question}</span>
                <span className="font-inter text-sm text-[var(--text-secondary)] leading-relaxed">{item.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="flex gap-5 min-h-[280px]">
        <ProjectionChart yearlyValues={yearlyValues} years={years} title="Growth Projection" />
        {/* Year-by-year table */}
        <div className="flex flex-col w-[346px] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-5 py-3 bg-[var(--bg-elevated)]">
            <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Year-by-Year Breakdown</span>
          </div>
          <div className="flex flex-col flex-1 overflow-auto">
            {yearlyValues.map((val, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-subtle)]">
                <span className="font-inter text-xs text-[var(--text-muted)]">Year {i}</span>
                <span className="font-dm-mono text-[13px] font-medium text-[var(--text-primary)]">{fmtMoney(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Historical chart */}
      <HistoricalChart data={histData} loading={histLoading} />

      {/* Disclaimer */}
      <DisclaimerBanner text="These projections are estimates based on the CAPM model and historical data. This is not financial advice. Actual returns may vary significantly." />
    </div>
  );
}
