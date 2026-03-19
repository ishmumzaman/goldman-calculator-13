import { useEffect, useState } from "react";
import { Download, Plus, TrendingUp } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import StatCard from "../components/cards/StatCard.jsx";
import AllocationDonutChart from "../components/charts/AllocationDonutChart.jsx";
import HoldingsTable from "../components/tables/HoldingsTable.jsx";
import DisclaimerBanner from "../components/ui/DisclaimerBanner.jsx";
import { fetchPortfolio } from "../lib/api.js";

/**
 * Portfolio screen – local-only holdings view.
 */
export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPortfolio().then((d) => {
      if (!cancelled) {
        setData(d);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <span className="font-inter text-sm text-[var(--text-muted)] animate-pulse">Loading portfolio…</span>
      </div>
    );
  }

  const { holdings, totalValue, totalProjected, avgReturn, bestPerformer } = data;

  const fmtMoney = (n) =>
    "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtMoneyShort = (n) => {
    if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
    return "$" + n.toLocaleString();
  };

  return (
    <div className="flex flex-col gap-7 flex-1 overflow-auto px-12 py-8">
      {/* Header */}
      <PageHeader
        title="Portfolio"
        subtitle="Track your simulated mutual fund holdings"
      >
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] font-inter text-[13px] font-medium text-[var(--text-secondary)]">
          <Download size={16} />
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--gs-gold)] font-inter text-[13px] font-semibold text-[var(--bg-page)]">
          <Plus size={16} />
          Add Holding
        </button>
      </PageHeader>

      {/* Summary cards row */}
      <div className="flex gap-4">
        <StatCard
          label="Total Portfolio Value"
          value={fmtMoney(totalValue)}
          sub={`+${(avgReturn * 100).toFixed(1)}% projected`}
          subColor="var(--success)"
        />
        <StatCard
          label="Total Holdings"
          value={String(holdings.length)}
          sub="Mutual funds tracked"
        />
        <StatCard
          label="Avg. Projected Return"
          value={`${(avgReturn * 100).toFixed(1)}%`}
          valueColor="var(--gs-gold)"
          sub="Weighted average rate"
        />
        <StatCard
          label="Best Performer"
          value={bestPerformer.ticker}
          sub={`+${(bestPerformer.projRate * 100).toFixed(1)}% projected return`}
          subColor="var(--success)"
        />
      </div>

      {/* Allocation + Holdings table */}
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Allocation card */}
        <div className="flex flex-col gap-5 w-[320px] p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Allocation</span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--gs-gold-tint)] font-inter text-[11px] font-semibold text-[var(--gs-gold)]">
              {holdings.length} funds
            </span>
          </div>
          <AllocationDonutChart
            holdings={holdings}
            totalLabel={fmtMoneyShort(totalValue)}
          />
        </div>

        {/* Holdings table */}
        <HoldingsTable
          holdings={holdings}
          totalPrincipal={totalValue}
          totalProjected={totalProjected}
          avgRate={avgReturn}
        />
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner text="Portfolio values are simulated projections based on CAPM estimates. This is not financial advice and actual returns may vary significantly." />
    </div>
  );
}
