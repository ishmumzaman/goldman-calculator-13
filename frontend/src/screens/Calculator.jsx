import { useEffect, useState } from "react";
import { TrendingUp, Calculator as CalcIcon, ChevronDown, Info, Timer } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import RiskFreeBadge from "../components/ui/RiskFreeBadge.jsx";
import { fetchFunds, fetchForecast, saveCalculation } from "../lib/api.js";

/**
 * Calculator / Input screen.
 * @param {{ onCalculate?: (result) => void }} props
 */
export default function Calculator({ onCalculate }) {
  const [funds, setFunds] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [principal, setPrincipal] = useState("10,000");
  const [years, setYears] = useState("5");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchFunds()
      .then((items) => {
        if (cancelled) return;
        setFunds(items);
        if (items.length) {
          setSelectedTicker((current) => current || items[0].ticker);
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

  const selectedFund = funds.find((fund) => fund.ticker === selectedTicker);

  const parsePrincipal = () => {
    const value = Number(principal.replace(/[^0-9.]/g, ""));
    return Number.isNaN(value) || value <= 0 ? null : value;
  };

  const parseYears = () => {
    const value = parseInt(years, 10);
    return Number.isNaN(value) || value <= 0 ? null : value;
  };

  const isValid = !!selectedTicker && parsePrincipal() !== null && parseYears() !== null;

  const handleCalculate = async () => {
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const result = await fetchForecast({
        ticker: selectedTicker,
        principal: parsePrincipal(),
        years: parseYears(),
      });
      await saveCalculation(result);
      onCalculate?.(result);
    } catch (err) {
      setError(err?.message ?? "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0 min-w-0 overflow-y-auto px-12 py-8">
      <PageHeader
        title="Mutual Fund Calculator"
        subtitle="Estimate future returns using the Capital Asset Pricing Model (CAPM)."
      >
        <RiskFreeBadge />
      </PageHeader>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-6 p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={20} className="text-[var(--gs-gold)]" />
              <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Investment Parameters</span>
            </div>
            <div className="h-px bg-[var(--border-subtle)]" />

            <div className="flex flex-col gap-2">
              <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">SELECT MUTUAL FUND</label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)] text-left"
                >
                  <span className="font-inter text-sm text-[var(--text-primary)]">
                    {selectedFund ? `${selectedFund.name} (${selectedFund.ticker})` : "Select a fund..."}
                  </span>
                  <ChevronDown size={16} className="text-[var(--text-muted)]" />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-lg overflow-hidden">
                    {funds.map((fund) => (
                      <button
                        key={fund.ticker}
                        onClick={() => {
                          setSelectedTicker(fund.ticker);
                          setDropdownOpen(false);
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <span className="font-inter text-sm text-[var(--text-primary)]">{fund.name} ({fund.ticker})</span>
                        <span className="font-inter text-xs text-[var(--text-muted)]">{fund.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">INITIAL INVESTMENT ($)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)]">
                  <span className="font-dm-mono text-sm font-medium text-[var(--text-muted)]">$</span>
                  <input
                    value={principal}
                    onChange={(event) => setPrincipal(event.target.value)}
                    className="bg-transparent flex-1 font-dm-mono text-sm font-medium text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">TIME HORIZON (YEARS)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)]">
                  <Timer size={14} className="text-[var(--text-muted)]" />
                  <input
                    value={years}
                    onChange={(event) => setYears(event.target.value)}
                    className="bg-transparent flex-1 font-dm-mono text-sm font-medium text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!isValid || loading}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-lg bg-gradient-to-b from-[#C9A96E] to-[#B8944F] font-inter text-sm font-semibold text-[var(--bg-page)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalcIcon size={18} />
              {loading ? "Calculating..." : "Calculate Future Value"}
            </button>

            <div className="flex items-center gap-2">
              <Info size={14} className="shrink-0 text-[var(--text-disabled)]" />
              <span className="font-inter text-[11px] text-[var(--text-disabled)]">
                Results are CAPM-based estimates, not guarantees. Past performance does not predict future returns.
              </span>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-[var(--orange-tint)] border border-[var(--orange-primary)]/25">
                <span className="font-inter text-sm text-[var(--orange-primary)]">{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 w-[380px]">
          {selectedFund && (
            <div className="flex flex-col gap-5 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Fund Details</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--success-tint)] font-inter text-[10px] font-medium text-[var(--success)]">Active</span>
              </div>
              <div className="h-px bg-[var(--border-subtle)]" />
              <FundRow label="Ticker" value={selectedFund.ticker} valueFont="font-dm-mono" />
              <FundRow label="Family" value={selectedFund.family || "-"} valueColor="var(--text-secondary)" />
              <FundRow label="Category" value={selectedFund.category} valueColor="var(--text-secondary)" />
              <FundRow
                label="Benchmark"
                value={selectedFund.benchmarkIndexTicker || "-"}
                valueColor="var(--gs-gold)"
                valueFont="font-dm-mono"
              />
            </div>
          )}

          <div className="flex flex-col gap-4 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Available Funds</span>
            {funds.slice(0, 4).map((fund, index) => (
              <div key={fund.ticker}>
                {index > 0 && <div className="h-px bg-[var(--border-subtle)] mb-4" />}
                <button
                  onClick={() => setSelectedTicker(fund.ticker)}
                  className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-inter text-[13px] font-medium text-[var(--text-primary)]">{fund.name}</span>
                    <span className="font-inter text-[11px] text-[var(--text-muted)]">{fund.category}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium font-inter bg-[var(--gs-blue-tint)] text-[var(--gs-blue)]">
                    {fund.family || "Fund"}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FundRow({ label, value, valueColor = "var(--text-primary)", valueFont = "font-inter" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-inter text-xs text-[var(--text-muted)]">{label}</span>
      <span className={`${valueFont} text-[13px] font-medium`} style={{ color: valueColor }}>{value}</span>
    </div>
  );
}
