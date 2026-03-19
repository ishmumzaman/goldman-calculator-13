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

/* ── Portfolio ── */
const MOCK_HOLDINGS = [
  { ticker: "VFIAX", name: "Vanguard 500 Index", principal: 50000, years: 10, projRate: 0.112, futureValue: 144626, color: "var(--gs-gold)" },
  { ticker: "FXAIX", name: "Fidelity 500 Index", principal: 35000, years: 7, projRate: 0.098, futureValue: 67442, color: "var(--gs-blue)" },
  { ticker: "SWPPX", name: "Schwab S&P 500 Index", principal: 25000, years: 5, projRate: 0.081, futureValue: 36924, color: "var(--success)" },
  { ticker: "VTSAX", name: "Vanguard Total Stock Mkt", principal: 37832, years: 8, projRate: 0.074, futureValue: 66280, color: "var(--orange-light)" },
];

export async function fetchPortfolio() {
  await delay(300);
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.principal, 0);
  const totalProjected = MOCK_HOLDINGS.reduce((s, h) => s + h.futureValue, 0);
  const avgReturn = MOCK_HOLDINGS.reduce((s, h) => s + h.projRate, 0) / MOCK_HOLDINGS.length;
  const best = [...MOCK_HOLDINGS].sort((a, b) => b.projRate - a.projRate)[0];
  return { holdings: MOCK_HOLDINGS, totalValue, totalProjected, avgReturn, bestPerformer: best };
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

/* ── Historical price data (for charts) ── */
export async function fetchFundHistory(ticker) {
  await delay(400);
  // Generates mock 5-year monthly data
  const points = [];
  let price = 100;
  for (let i = 0; i < 60; i++) {
    price *= 1 + (Math.random() * 0.06 - 0.02);
    points.push({ month: i, value: Math.round(price * 100) / 100 });
  }
  return points;
}
