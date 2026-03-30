import { useEffect, useState } from "react";
import { TrendingUp, Calculator as CalcIcon, ChevronDown, Info, Timer } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import RiskFreeBadge from "../components/ui/RiskFreeBadge.jsx";
import { fetchFunds, fetchForecast } from "../lib/api.js";

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

  useEffect(() => {
    fetchFunds().then((f) => {
      setFunds(f);
      if (f.length) setSelectedTicker(f[0].ticker);
    });
  }, []);

  const selectedFund = funds.find((f) => f.ticker === selectedTicker);

  const parsePrincipal = () => {
    const n = Number(principal.replace(/[^0-9.]/g, ""));
    return isNaN(n) || n <= 0 ? null : n;
  };
  const parseYears = () => {
    const n = parseInt(years, 10);
    return isNaN(n) || n <= 0 ? null : n;
  };

  const isValid = !!selectedTicker && parsePrincipal() !== null && parseYears() !== null;

  const handleCalculate = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const result = await fetchForecast({
        ticker: selectedTicker,
        principal: parsePrincipal(),
        years: parseYears(),
      });
      onCalculate?.(result);
    } catch {
      // TODO: show error toast
    } finally {
      setLoading(false);
    }
  };

  const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0 min-w-0 overflow-y-auto px-12 py-8">
      <PageHeader
        title="Mutual Fund Calculator"
        subtitle="Estimate future returns using the Capital Asset Pricing Model (CAPM)."
      >
        <RiskFreeBadge />
      </PageHeader>

      {/* Two-column layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* ── Left: Form ── */}
        <div className="flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-6 p-7 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            {/* Title */}
            <div className="flex items-center gap-2.5">
              <TrendingUp size={20} className="text-[var(--gs-gold)]" />
              <span className="font-inter text-base font-semibold text-[var(--text-primary)]">Investment Parameters</span>
            </div>
            <div className="h-px bg-[var(--border-subtle)]" />

            {/* Fund selector */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">SELECT MUTUAL FUND</label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)] text-left"
                >
                  <span className="font-inter text-sm text-[var(--text-primary)]">
                    {selectedFund ? `${selectedFund.name} (${selectedFund.ticker})` : "Select a fund…"}
                  </span>
                  <ChevronDown size={16} className="text-[var(--text-muted)]" />
                </button>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-lg overflow-hidden">
                    {funds.map((f) => (
                      <button
                        key={f.ticker}
                        onClick={() => { setSelectedTicker(f.ticker); setDropdownOpen(false); }}
                        className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-[var(--bg-surface)] transition-colors"
                      >
                        <span className="font-inter text-sm text-[var(--text-primary)]">{f.name} ({f.ticker})</span>
                        <span className="font-dm-mono text-xs text-[var(--text-muted)]">β {f.beta}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Principal + Years row */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-2 flex-1">
                <label className="font-inter text-[11px] font-semibold tracking-wide text-[var(--text-muted)]">INITIAL INVESTMENT ($)</label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-recessed)] border border-[var(--border-subtle)]">
                  <span className="font-dm-mono text-sm font-medium text-[var(--text-muted)]">$</span>
                  <input
                    value={principal}
                    onChange={(e) => setPrincipal(e.target.value)}
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
                    onChange={(e) => setYears(e.target.value)}
                    className="bg-transparent flex-1 font-dm-mono text-sm font-medium text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Calculate button */}
            <button
              onClick={handleCalculate}
              disabled={!isValid || loading}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-lg bg-gradient-to-b from-[#C9A96E] to-[#B8944F] font-inter text-sm font-semibold text-[var(--bg-page)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalcIcon size={18} />
              {loading ? "Calculating…" : "Calculate Future Value"}
            </button>

            {/* Estimate disclaimer */}
            <div className="flex items-center gap-2">
              <Info size={14} className="shrink-0 text-[var(--text-disabled)]" />
              <span className="font-inter text-[11px] text-[var(--text-disabled)]">
                Results are CAPM-based estimates, not guarantees. Past performance does not predict future returns.
              </span>
            </div>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6 w-[380px]">
          {/* Fund Details card */}
          {selectedFund && (
            <div className="flex flex-col gap-5 p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Fund Details</span>
                <span className="px-2.5 py-1 rounded-full bg-[var(--success-tint)] font-inter text-[10px] font-medium text-[var(--success)]">Active</span>
              </div>
              <div className="h-px bg-[var(--border-subtle)]" />
              <FundRow label="Ticker" value={selectedFund.ticker} valueFont="font-dm-mono" />
              <FundRow label="Beta (β)" value={selectedFund.beta.toFixed(2)} valueColor="var(--orange-primary)" valueFont="font-dm-mono" hasInfo />
              <FundRow label="Last Year Return" value={`+${fmtPct(selectedFund.lastYearReturn)}`} valueColor="var(--success)" valueFont="font-dm-mono" hasInfo />
              <FundRow label="Category" value={selectedFund.category} valueColor="var(--text-secondary)" />
              <FundRow label="CAPM Rate (r)" value={fmtPct(selectedFund.capmRate)} valueColor="var(--gs-gold)" valueFont="font-dm-mono" hasInfo />
            </div>
          )}

          {/* Popular Funds card */}
          <div className="flex flex-col gap-4 p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
            <span className="font-inter text-sm font-semibold text-[var(--text-primary)]">Popular Funds</span>
            {funds.slice(1, 4).map((f, i) => (
              <div key={f.ticker}>
                {i > 0 && <div className="h-px bg-[var(--border-subtle)] mb-4" />}
                <button
                  onClick={() => setSelectedTicker(f.ticker)}
                  className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-inter text-[13px] font-medium text-[var(--text-primary)]">{f.name}</span>
                    <span className="font-inter text-[11px] text-[var(--text-muted)]">{f.category}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium font-inter ${
                    f.beta > 1.05 ? "bg-[var(--orange-tint)] text-[var(--orange-primary)]"
                    : f.beta < 0.99 ? "bg-[var(--success-tint)] text-[var(--success)]"
                    : "bg-[var(--gs-blue-tint)] text-[var(--gs-blue)]"
                  }`}>
                    β {f.beta.toFixed(2)}
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

function FundRow({ label, value, valueColor = "var(--text-primary)", valueFont = "font-inter", hasInfo = false }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="font-inter text-xs text-[var(--text-muted)]">{label}</span>
        {hasInfo && <Info size={12} className="text-[var(--text-disabled)]" />}
      </div>
      <span className={`${valueFont} text-[13px] font-medium`} style={{ color: valueColor }}>{value}</span>
    </div>
  );
}
