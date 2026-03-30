/* ──────────────────────────────────────────────
   Mock API layer – swap for real fetch() later
   ────────────────────────────────────────────── */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/* ── Funds ── */
export const FUNDS = [
  { ticker: "SOPVX", name: "ClearBridge Large Cap Growth", category: "Large Cap Growth", beta: 1.12, lastYearReturn: 0.184, capmRate: 0.201, expenseRatio: 0.0052 },
  { ticker: "VFIAX", name: "Vanguard 500 Index", category: "Large Blend", beta: 1.0, lastYearReturn: 0.162, capmRate: 0.164, expenseRatio: 0.0004 },
  { ticker: "FXAIX", name: "Fidelity 500 Index", category: "Large Blend", beta: 0.98, lastYearReturn: 0.162, capmRate: 0.1593, expenseRatio: 0.0002 },
  { ticker: "SWPPX", name: "Schwab S&P 500 Index", category: "Large Blend", beta: 1.01, lastYearReturn: 0.158, capmRate: 0.168, expenseRatio: 0.0002 },
  { ticker: "VTSAX", name: "Vanguard Total Stock Mkt", category: "Large Blend", beta: 1.04, lastYearReturn: 0.155, capmRate: 0.174, expenseRatio: 0.0003 },
];

export async function fetchFunds() {
  await delay();
  return FUNDS;
}

export async function fetchFund(ticker) {
  await delay(200);
  return FUNDS.find((f) => f.ticker === ticker) ?? null;
}

/* ── Forecast (single fund) ── */
export async function fetchForecast({ ticker, principal, years }) {
  await delay(600);
  const fund = FUNDS.find((f) => f.ticker === ticker);
  if (!fund) throw new Error("Fund not found");

  const rf = 0.0425;
  const baseRate = fund.capmRate;
  const consRate = Math.max(baseRate - 0.02, 0);
  const optRate = baseRate + 0.02;

  const fv = (p, r, t) => p * Math.pow(1 + r, t);

  const yearlyValues = Array.from({ length: years + 1 }, (_, i) => fv(principal, baseRate, i));

  /** Same series the results page charts — deterministic for this ticker. */
  const historicalSeries = buildFundHistorySeries(ticker);

  return {
    fund,
    principal,
    years,
    projectedRate: baseRate,
    futureValue: fv(principal, baseRate, years),
    riskFreeRate: rf,
    beta: fund.beta,
    expectedReturn: fund.lastYearReturn,
    scenarios: [
      { scenario: "conservative", rate: consRate, futureValue: fv(principal, consRate, years) },
      { scenario: "base", rate: baseRate, futureValue: fv(principal, baseRate, years) },
      { scenario: "optimistic", rate: optRate, futureValue: fv(principal, optRate, years) },
    ],
    yearlyValues,
    historicalSeries,
  };
}

/* ── Compare (2-3 funds) ── */
export async function fetchComparison({ tickers, principal, years }) {
  await delay(600);
  return tickers.map((ticker) => {
    const fund = FUNDS.find((f) => f.ticker === ticker);
    if (!fund) return null;
    const fv = principal * Math.pow(1 + fund.capmRate, years);
    return { fund, futureValue: fv, projectedRate: fund.capmRate };
  }).filter(Boolean);
}

/* ── History ── */
const MOCK_HISTORY = [
  { id: "1", fundName: "Fidelity Contrafund", ticker: "FCNTX", principal: 25000, years: 10, conservative: 43438, base: 51799, optimistic: 61799, date: "Mar 17, 2026", status: "gain" },
  { id: "2", fundName: "Vanguard 500 Index", ticker: "VFIAX", principal: 70899, years: 5, conservative: 119390, base: 131986, optimistic: 131986, date: "Mar 17, 2026", status: "gain" },
  { id: "3", fundName: "T. Rowe Price Growth", ticker: "PRGFX", principal: 10987, years: 8, conservative: 12944, base: 15627, optimistic: 15627, date: "Mar 15, 2026", status: "gain" },
  { id: "4", fundName: "iShares S&P 500 Index", ticker: "BSPAX", principal: 95000, years: 76, conservative: 13199, base: 118706, optimistic: 118706, date: "Mar 12, 2026", status: "loss" },
  { id: "5", fundName: "Fidelity Blue Chip", ticker: "FBIOX", principal: 100000, years: 8, conservative: 131414, base: 82382, optimistic: 68768, date: "Mar 10, 2026", status: "gain" },
  { id: "6", fundName: "Allianz Core S&P 500", ticker: "ACSAX", principal: 32000, years: 12, conservative: 24100, base: 50960, optimistic: 50960, date: "Feb 26, 2026", status: "gain" },
];

export async function fetchHistory() {
  await delay(300);
  return MOCK_HISTORY;
}

export async function saveCalculation(item) {
  await delay(200);
  MOCK_HISTORY.unshift({ ...item, id: String(Date.now()), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
  return { ok: true };
}

/* ── Portfolio (persisted in localStorage) ── */
const PORTFOLIO_STORAGE_KEY = "mutual-fund-portfolio-holdings-v1";

const PORTFOLIO_COLORS = ["var(--gs-gold)", "var(--gs-blue)", "var(--success)", "var(--orange-light)"];

const MOCK_HOLDINGS = [
  { id: "seed-vfiax", ticker: "VFIAX", name: "Vanguard 500 Index", principal: 50000, years: 10, projRate: 0.112, futureValue: 144626, color: "var(--gs-gold)" },
  { id: "seed-fxaix", ticker: "FXAIX", name: "Fidelity 500 Index", principal: 35000, years: 7, projRate: 0.098, futureValue: 67442, color: "var(--gs-blue)" },
  { id: "seed-swppx", ticker: "SWPPX", name: "Schwab S&P 500 Index", principal: 25000, years: 5, projRate: 0.081, futureValue: 36924, color: "var(--success)" },
  { id: "seed-vtsax", ticker: "VTSAX", name: "Vanguard Total Stock Mkt", principal: 37832, years: 8, projRate: 0.074, futureValue: 66280, color: "var(--orange-light)" },
];

function ensureHoldingIds(list) {
  return list.map((h, i) => ({
    ...h,
    id: h.id ?? `${h.ticker}-${i}`,
  }));
}

function loadPortfolioHoldingsFromStorage() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return ensureHoldingIds(parsed);
  } catch {
    return null;
  }
}

function savePortfolioHoldingsToStorage(list) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(list));
}

function getSeedHoldings() {
  return MOCK_HOLDINGS.map((h) => ({ ...h }));
}

function buildHoldingRow(fund, principal, years, colorIndex) {
  const projRate = fund.capmRate;
  const futureValue = Math.round(principal * Math.pow(1 + projRate, years));
  return {
    id: `${fund.ticker}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ticker: fund.ticker,
    name: fund.name,
    principal,
    years,
    projRate,
    futureValue,
    color: PORTFOLIO_COLORS[colorIndex % PORTFOLIO_COLORS.length],
  };
}

function summarizePortfolio(holdings) {
  if (!holdings.length) {
    return {
      holdings: [],
      totalValue: 0,
      totalProjected: 0,
      avgReturn: 0,
      bestPerformer: { ticker: "—", projRate: 0 },
    };
  }
  const totalValue = holdings.reduce((s, h) => s + h.principal, 0);
  const totalProjected = holdings.reduce((s, h) => s + h.futureValue, 0);
  const avgReturn = holdings.reduce((s, h) => s + h.projRate, 0) / holdings.length;
  const best = [...holdings].sort((a, b) => b.projRate - a.projRate)[0];
  return { holdings, totalValue, totalProjected, avgReturn, bestPerformer: best };
}

export async function fetchPortfolio() {
  await delay(300);
  let list = loadPortfolioHoldingsFromStorage();
  if (list == null) {
    list = getSeedHoldings();
  } else {
    list = ensureHoldingIds(list);
  }
  return summarizePortfolio(list);
}

/**
 * Add a holding using CAPM rate from FUNDS; persists to localStorage.
 * @param {{ ticker: string, principal: number, years: number }} input
 */
export async function addPortfolioHolding({ ticker, principal, years }) {
  await delay(200);
  const fund = FUNDS.find((f) => f.ticker === ticker);
  if (!fund) throw new Error("Fund not found");
  const p = Number(principal);
  const y = Number(years);
  if (!Number.isFinite(p) || p <= 0) throw new Error("Principal must be greater than zero");
  if (!Number.isFinite(y) || y < 1 || y > 50) throw new Error("Years must be between 1 and 50");

  let list = loadPortfolioHoldingsFromStorage();
  if (list == null) list = getSeedHoldings();
  else list = ensureHoldingIds(list);

  const row = buildHoldingRow(fund, p, y, list.length);
  list.push(row);
  savePortfolioHoldingsToStorage(list);
  return summarizePortfolio(list);
}

/**
 * Remove a holding by stable row id.
 * @param {string} id
 */
export async function removePortfolioHolding(id) {
  await delay(150);
  let list = loadPortfolioHoldingsFromStorage();
  if (list == null) list = getSeedHoldings();
  else list = ensureHoldingIds(list);

  const next = list.filter((h) => h.id !== id);
  savePortfolioHoldingsToStorage(next);
  return summarizePortfolio(next);
}

/* ── Explanation ── */
export async function fetchExplanation({ ticker }) {
  await delay(300);
  const fund = FUNDS.find((f) => f.ticker === ticker);
  if (!fund) return [];
  return [
    { question: "What rate did we use?", answer: `We used a CAPM-derived rate of ${(fund.capmRate * 100).toFixed(2)}%. The formula is r = Rf + β(Rm − Rf) = 4.25% + ${fund.beta} × (${(fund.lastYearReturn * 100).toFixed(1)}% − 4.25%) = ${(fund.capmRate * 100).toFixed(2)}%.` },
    { question: "How was beta obtained?", answer: `Beta (β = ${fund.beta}) measures how volatile this fund is relative to the overall market. A β of ${fund.beta} means the fund moves ~${Math.round((fund.beta - 1) * 100)}% more than the market on average.` },
    { question: "How was expected return estimated?", answer: "The expected market return is based on historical S&P 500 performance and analyst consensus for broad market returns over the selected horizon." },
    { question: "What should I know?", answer: "This is an estimate, not a guarantee. Actual returns depend on market conditions, fund management, and economic factors. Past performance does not guarantee future results." },
  ];
}

/* ── Historical index series (simulated, fund-consistent) ── */

function hashTicker(ticker) {
  let h = 2166136261;
  const s = String(ticker);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** @param {number} seed @param {number} i @returns {number} in [0, 1) */
function seededUnit(seed, i) {
  const x = Math.sin((seed + i * 2654435769) % 1e9) * 10000;
  return x - Math.floor(x);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * 60 monthly points: normalized index (base 100).
 * - Months 0–47: drift derived from fund CAPM rate + deterministic “noise” scaled by beta.
 * - Months 48–59: exactly 12 steps so total return matches fund.lastYearReturn (stated trailing return).
 * Same ticker always yields the same path (no Math.random).
 * @param {string} ticker
 * @returns {Array<{ month: number, value: number }>}
 */
export function buildFundHistorySeries(ticker) {
  const fund = FUNDS.find((f) => f.ticker === ticker);
  if (!fund) return [];

  const seed = hashTicker(ticker);
  const capm = Math.max(fund.capmRate, 0.001);
  const trail = fund.lastYearReturn;
  /** Long-window monthly drift slightly below CAPM so the final 12m step can absorb trailing return. */
  const monthlyLongRun = Math.pow(1 + capm * 0.62, 1 / 12) - 1;
  const noiseAmp = 0.011 * (0.82 + 0.18 * Math.min(Math.max(fund.beta, 0.5), 1.8));

  const points = [];
  let v = 100;
  points.push({ month: 0, value: round2(v) });

  for (let m = 1; m <= 47; m++) {
    const u = seededUnit(seed, m) - 0.5;
    const r = monthlyLongRun + u * noiseAmp;
    v *= 1 + r;
    points.push({ month: m, value: round2(v) });
  }

  const g = Math.pow(1 + trail, 1 / 12);
  for (let m = 48; m < 60; m++) {
    v *= g;
    points.push({ month: m, value: round2(v) });
  }

  return points;
}

/**
 * Fetch historical series for a fund (mock: `{ month, value }[]`).
 * When wired to a real API, the response may be a bare array or wrapped
 * (`{ data, points, series, … }`); `HistoricalChart` normalizes via `normalizeHistoricalLineData`
 * in `src/lib/historicalSeries.js`.
 */
export async function fetchFundHistory(ticker) {
  await delay(400);
  return buildFundHistorySeries(ticker);
}
