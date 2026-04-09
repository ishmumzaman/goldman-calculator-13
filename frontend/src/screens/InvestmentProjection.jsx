import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Download, Plus, HelpCircle } from "lucide-react";
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
  const [histState, setHistState] = useState({ ticker: "", data: [] });
  const embeddedHistoricalSeries = useMemo(
    () => (Array.isArray(result?.historicalSeries) ? result.historicalSeries : []),
    [result],
  );

  useEffect(() => {
    if (!result?.fund?.ticker) return;

    let cancelled = false;

    fetchExplanation({ result }).then((items) => {
      if (!cancelled) {
        setExplanation(items);
      }
    });

    if (embeddedHistoricalSeries.length) {
      return () => {
        cancelled = true;
      };
    }

    fetchFundHistory(result).then((data) => {
      if (!cancelled) {
        setHistState({ ticker: result.fund.ticker, data });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [embeddedHistoricalSeries, result]);

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
  const fmtMoney = (value) => "$" + Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtPct = (value) => `${(Number(value) * 100).toFixed(2)}%`;
  const totalReturn = futureValue - principal;
  const totalReturnPct = ((totalReturn / principal) * 100).toFixed(1);

  const conservative = scenarios.find((item) => item.scenario === "conservative");
  const base = scenarios.find((item) => item.scenario === "base");
  const optimistic = scenarios.find((item) => item.scenario === "optimistic");
  const historicalData = embeddedHistoricalSeries.length
    ? embeddedHistoricalSeries
    : histState.ticker === fund.ticker ? histState.data : [];
  const historicalLoading = !embeddedHistoricalSeries.length && histState.ticker !== fund.ticker;

  return (
    <div className="flex flex-col gap-7 flex-1 min-h-0 min-w-0 overflow-y-auto px-12 py-8">
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

      <div className="flex gap-4">
        <StatCard label="Risk-Free Rate (Rf)" value={fmtPct(riskFreeRate)} sub="Backend configuration" valueColor="var(--gs-blue)" />
        <StatCard label="Beta (β)" value={beta.toFixed(2)} sub="Fund volatility input" valueColor="var(--orange-primary)" />
        <StatCard label="Expected Return (Rm)" value={fmtPct(expectedReturn)} sub="Backend market-return input" valueColor="var(--success)" />
        <StatCard label="CAPM Rate (r)" value={fmtPct(projectedRate)} sub="Projected annualized" valueColor="var(--gs-gold)" />
      </div>

      <div className="flex flex-col gap-4">
        <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Scenario Analysis</span>
        <div className="flex gap-4">
          {conservative && <ScenarioCard label="Conservative" rate={fmtPct(conservative.rate)} futureValue={fmtMoney(conservative.futureValue)} accentColor="var(--orange-primary)" />}
          {base && <ScenarioCard label="Base" rate={fmtPct(base.rate)} futureValue={fmtMoney(base.futureValue)} accentColor="var(--gs-gold)" active />}
          {optimistic && <ScenarioCard label="Optimistic" rate={fmtPct(optimistic.rate)} futureValue={fmtMoney(optimistic.futureValue)} accentColor="var(--success)" />}
        </div>
        {conservative && optimistic && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <span className="font-dm-mono text-xs text-[var(--orange-primary)]">{fmtMoney(conservative.futureValue)}</span>
            <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--orange-primary)] via-[var(--gs-gold)] to-[var(--success)] rounded-full" style={{ width: "100%" }} />
            </div>
            <span className="font-dm-mono text-xs text-[var(--success)]">{fmtMoney(optimistic.futureValue)}</span>
          </div>
        )}
      </div>

      {explanation.length > 0 && (
        <div className="flex flex-col gap-4 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-[var(--gs-blue)]" />
            <span className="font-inter text-base font-semibold text-[var(--text-primary)]">How We Calculated This</span>
          </div>
          <div className="flex flex-col gap-4">
            {explanation.map((item, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <span className="font-inter text-sm font-semibold text-[var(--gs-gold)]">{item.question}</span>
                <span className="font-inter text-sm text-[var(--text-secondary)] leading-relaxed">{item.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-5 min-h-[280px]">
        <ProjectionChart yearlyValues={yearlyValues} years={years} title="Growth Projection" />
        <div className="flex flex-col w-[346px] rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-5 py-3 bg-[var(--bg-elevated)]">
            <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Year-by-Year Breakdown</span>
          </div>
          <div className="flex flex-col flex-1 overflow-auto">
            {yearlyValues.map((value, index) => (
              <div key={index} className="flex items-center justify-between px-5 py-2.5 border-t border-[var(--border-subtle)]">
                <span className="font-inter text-xs text-[var(--text-muted)]">Year {index}</span>
                <span className="font-dm-mono text-[13px] font-medium text-[var(--text-primary)]">{fmtMoney(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HistoricalChart
        data={historicalData}
        loading={historicalLoading}
        valueFormat="index"
        title="Historical performance (derived)"
        subtitle="Normalized index (base 100). This line is derived client-side from the backend forecast inputs until a dedicated historical-series endpoint exists."
      />

      <DisclaimerBanner text="These projections are estimates based on the backend CAPM model. This is not financial advice and actual returns may vary significantly." />
    </div>
  );
}
