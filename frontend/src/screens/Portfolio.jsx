import { useCallback, useEffect, useState } from "react";
import { Download, Plus } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import StatCard from "../components/cards/StatCard.jsx";
import AllocationDonutChart from "../components/charts/AllocationDonutChart.jsx";
import HoldingsTable from "../components/tables/HoldingsTable.jsx";
import DisclaimerBanner from "../components/ui/DisclaimerBanner.jsx";
import AddHoldingModal from "../components/modals/AddHoldingModal.jsx";
import { fetchPortfolio, removePortfolioHolding } from "../lib/api.js";

/**
 * Portfolio screen – holdings persisted in localStorage via api layer.
 */
export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchPortfolio().then((portfolio) => {
      if (!cancelled) {
        setData(portfolio);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdded = useCallback((summary) => {
    setData(summary);
  }, []);

  const handleRemove = useCallback(async (id) => {
    try {
      const summary = await removePortfolioHolding(id);
      setData(summary);
    } catch {
      /* ignore */
    }
  }, []);

  if (loading || !data) {
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
    <div className="flex flex-col gap-7 flex-1 min-h-0 min-w-0 overflow-y-auto px-12 py-8">
      <PageHeader title="Portfolio" subtitle="Track your simulated mutual fund holdings">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-default)] font-inter text-[13px] font-medium text-[var(--text-secondary)]"
        >
          <Download size={16} />
          Export
        </button>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--gs-gold)] font-inter text-[13px] font-semibold text-[var(--bg-page)]"
        >
          <Plus size={16} />
          Add Holding
        </button>
      </PageHeader>

      <div className="flex gap-4 flex-wrap">
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

      {/* Row sizes to content: allocation card grows with fund count; table has its own min-height + scroll */}
      <div className="flex gap-5 flex-col lg:flex-row lg:items-start min-w-0">
        <div className="flex flex-col gap-5 w-full lg:w-[320px] lg:shrink-0 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-visible">
          <div className="flex items-center justify-between shrink-0">
            <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Allocation</span>
            <span className="px-2.5 py-1 rounded-md bg-[var(--gs-gold-tint)] font-inter text-[11px] font-semibold text-[var(--gs-gold)]">
              {holdings.length} funds
            </span>
          </div>
          <AllocationDonutChart holdings={holdings} totalLabel={fmtMoneyShort(totalValue)} />
        </div>

        <div className="flex flex-col flex-1 min-w-0 min-h-[min(360px,55vh)] lg:min-h-[400px]">
          <HoldingsTable
            holdings={holdings}
            totalPrincipal={totalValue}
            totalProjected={totalProjected}
            avgRate={avgReturn}
            onRemove={handleRemove}
          />
        </div>
      </div>

      <DisclaimerBanner text="Portfolio values are simulated projections based on CAPM estimates. This is not financial advice and actual returns may vary significantly." />

      <AddHoldingModal open={addOpen} onClose={() => setAddOpen(false)} onAdded={handleAdded} />
    </div>
  );
}
