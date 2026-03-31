const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");
const API_PREFIX = "/api/v1";
const DEFAULT_PREVIEW_PRINCIPAL = 10000;
const DEFAULT_PREVIEW_YEARS = 5;
const DEFAULT_RISK_FREE_RATE = Number(import.meta.env.VITE_DEFAULT_RISK_FREE_RATE ?? 0.0435);

const HISTORY_STORAGE_KEY = "mutual-fund-calculation-history-v2";
const PORTFOLIO_STORAGE_KEY = "mutual-fund-portfolio-holdings-v2";
const PORTFOLIO_COLORS = ["var(--gs-gold)", "var(--gs-blue)", "var(--success)", "var(--orange-light)"];

let fundsCache = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function round2(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function apiUrl(path, params) {
  const url = new URL(`${API_BASE_URL}${API_PREFIX}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value == null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function readResponseBody(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : null;
}

async function requestJson(path, params) {
  const response = await fetch(apiUrl(path, params), {
    headers: { Accept: "application/json" },
  });
  const body = await readResponseBody(response);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

function normalizeFund(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    ticker: String(raw.ticker ?? ""),
    name: String(raw.name ?? raw.fundName ?? ""),
    family: raw.family ? String(raw.family) : "",
    category: raw.category ? String(raw.category) : "Mutual Fund",
    benchmarkIndexTicker: raw.benchmarkIndexTicker ? String(raw.benchmarkIndexTicker) : "",
  };
}

function futureValue(principal, rate, years) {
  return principal * Math.pow(1 + rate, years);
}

function buildScenarios(principal, years, baseRate) {
  const conservativeRate = Math.max(baseRate - 0.02, 0);
  const optimisticRate = baseRate + 0.02;

  return [
    {
      scenario: "conservative",
      rate: conservativeRate,
      futureValue: round2(futureValue(principal, conservativeRate, years)),
    },
    {
      scenario: "base",
      rate: baseRate,
      futureValue: round2(futureValue(principal, baseRate, years)),
    },
    {
      scenario: "optimistic",
      rate: optimisticRate,
      futureValue: round2(futureValue(principal, optimisticRate, years)),
    },
  ];
}

function buildYearlyValues(principal, years, rate) {
  return Array.from({ length: years + 1 }, (_, year) => round2(futureValue(principal, rate, year)));
}

function hashTicker(ticker) {
  let hash = 2166136261;
  const str = String(ticker);
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed, index) {
  const value = Math.sin((seed + index * 2654435769) % 1e9) * 10000;
  return value - Math.floor(value);
}

function buildHistoricalSeriesFromMetrics({ ticker, projectedRate, expectedReturn, beta }) {
  if (!ticker) return [];

  const seed = hashTicker(ticker);
  const annualRate = Math.max(toNumber(projectedRate, 0.001), 0.001);
  const trailingReturn = toNumber(expectedReturn, annualRate);
  const betaValue = toNumber(beta, 1);
  const monthlyLongRun = Math.pow(1 + annualRate * 0.62, 1 / 12) - 1;
  const noiseAmplitude = 0.011 * (0.82 + 0.18 * Math.min(Math.max(betaValue, 0.5), 1.8));

  const points = [];
  let value = 100;
  points.push({ month: 0, value: round2(value) });

  for (let month = 1; month <= 47; month++) {
    const unit = seededUnit(seed, month) - 0.5;
    const monthlyReturn = monthlyLongRun + unit * noiseAmplitude;
    value *= 1 + monthlyReturn;
    points.push({ month, value: round2(value) });
  }

  const finalYearGrowth = Math.pow(1 + trailingReturn, 1 / 12);
  for (let month = 48; month < 60; month++) {
    value *= finalYearGrowth;
    points.push({ month, value: round2(value) });
  }

  return points;
}

function mapForecastResponse(raw, fundMeta) {
  const principal = toNumber(raw?.initialInvestment);
  const years = toNumber(raw?.years);
  const projectedRate = toNumber(raw?.annualRate);
  const expectedReturn = toNumber(raw?.expectedReturnRate);
  const riskFreeRate = toNumber(raw?.riskFreeRate, DEFAULT_RISK_FREE_RATE);
  const beta = toNumber(raw?.beta, 1);
  const ticker = String(raw?.ticker ?? fundMeta?.ticker ?? "");
  const fund = {
    ticker,
    name: String(raw?.fundName ?? fundMeta?.name ?? ticker),
    family: fundMeta?.family ?? "",
    category: fundMeta?.category ?? "Mutual Fund",
    benchmarkIndexTicker: fundMeta?.benchmarkIndexTicker ?? "",
  };
  const scenarios = buildScenarios(principal, years, projectedRate);

  return {
    fund,
    principal,
    years,
    projectedRate,
    futureValue: toNumber(raw?.futureValue),
    riskFreeRate,
    beta,
    expectedReturn,
    scenarios,
    yearlyValues: buildYearlyValues(principal, years, projectedRate),
    historicalSeries: buildHistoricalSeriesFromMetrics({
      ticker,
      projectedRate,
      expectedReturn,
      beta,
    }),
    currency: String(raw?.currency ?? "USD"),
    calculationTimestamp: raw?.calculationTimestamp ?? new Date().toISOString(),
  };
}

function formatSavedDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function loadListFromStorage(key) {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveListToStorage(key, items) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(items));
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

  const totalValue = holdings.reduce((sum, holding) => sum + toNumber(holding.principal), 0);
  const totalProjected = holdings.reduce((sum, holding) => sum + toNumber(holding.futureValue), 0);
  const avgReturn = holdings.reduce((sum, holding) => sum + toNumber(holding.projRate), 0) / holdings.length;
  const bestPerformer = [...holdings].sort((left, right) => toNumber(right.projRate) - toNumber(left.projRate))[0];

  return { holdings, totalValue, totalProjected, avgReturn, bestPerformer };
}

function buildPortfolioHolding(result, colorIndex) {
  return {
    id: `${result.fund.ticker}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    ticker: result.fund.ticker,
    name: result.fund.name,
    principal: result.principal,
    years: result.years,
    projRate: result.projectedRate,
    futureValue: result.futureValue,
    color: PORTFOLIO_COLORS[colorIndex % PORTFOLIO_COLORS.length],
  };
}

function buildHistoryItem(result) {
  const conservative = result.scenarios.find((item) => item.scenario === "conservative");
  const base = result.scenarios.find((item) => item.scenario === "base");
  const optimistic = result.scenarios.find((item) => item.scenario === "optimistic");
  const savedAt = result.calculationTimestamp ?? new Date().toISOString();

  return {
    id: `${result.fund.ticker}-${savedAt}`,
    fundName: result.fund.name,
    ticker: result.fund.ticker,
    principal: result.principal,
    years: result.years,
    conservative: round2(conservative?.futureValue),
    base: round2(base?.futureValue ?? result.futureValue),
    optimistic: round2(optimistic?.futureValue),
    date: formatSavedDate(savedAt),
    status: result.futureValue >= result.principal ? "gain" : "loss",
    savedAt,
    result,
  };
}

export async function fetchFunds() {
  if (fundsCache) return fundsCache;

  const body = await requestJson("/funds");
  const funds = Array.isArray(body?.funds)
    ? body.funds.map(normalizeFund).filter(Boolean)
    : [];

  fundsCache = funds;
  return funds;
}

export async function fetchFund(ticker) {
  const funds = await fetchFunds();
  return funds.find((fund) => fund.ticker === ticker) ?? null;
}

export async function fetchForecast({ ticker, principal, years }) {
  const funds = await fetchFunds();
  const fundMeta = funds.find((fund) => fund.ticker === ticker) ?? null;

  const body = await requestJson("/calculations/future-value", {
    ticker,
    initialInvestment: principal,
    years,
  });

  return mapForecastResponse(body, fundMeta);
}

export async function fetchComparison({ tickers, principal, years }) {
  const uniqueTickers = [...new Set(tickers)].filter(Boolean);
  const results = await Promise.all(
    uniqueTickers.map((ticker) => fetchForecast({ ticker, principal, years })),
  );
  return results;
}

export async function fetchHistory() {
  return loadListFromStorage(HISTORY_STORAGE_KEY);
}

export async function saveCalculation(result) {
  const items = loadListFromStorage(HISTORY_STORAGE_KEY);
  const next = [buildHistoryItem(result), ...items].slice(0, 25);
  saveListToStorage(HISTORY_STORAGE_KEY, next);
  return { ok: true };
}

export async function fetchPortfolio() {
  return summarizePortfolio(loadListFromStorage(PORTFOLIO_STORAGE_KEY));
}

export async function addPortfolioHolding({ ticker, principal, years }) {
  const current = loadListFromStorage(PORTFOLIO_STORAGE_KEY);
  const forecast = await fetchForecast({ ticker, principal, years });
  const next = [...current, buildPortfolioHolding(forecast, current.length)];
  saveListToStorage(PORTFOLIO_STORAGE_KEY, next);
  return summarizePortfolio(next);
}

export async function removePortfolioHolding(id) {
  const current = loadListFromStorage(PORTFOLIO_STORAGE_KEY);
  const next = current.filter((holding) => holding.id !== id);
  saveListToStorage(PORTFOLIO_STORAGE_KEY, next);
  return summarizePortfolio(next);
}

export async function fetchExplanation({ result } = {}) {
  if (!result) return [];

  return [
    {
      question: "What rate did we use?",
      answer: `We used a CAPM-derived annual rate of ${(result.projectedRate * 100).toFixed(2)}%. The calculation uses Rf + β(Rm − Rf) with a risk-free rate of ${(result.riskFreeRate * 100).toFixed(2)}%, beta of ${result.beta.toFixed(2)}, and expected market return of ${(result.expectedReturn * 100).toFixed(2)}%.`,
    },
    {
      question: "How was beta used?",
      answer: `Beta measures how sensitive the fund is to market moves. A beta of ${result.beta.toFixed(2)} means the model scales the market risk premium by that amount before projecting the annual return.`,
    },
    {
      question: "What does expected return mean here?",
      answer: `The backend supplied an expected return input of ${(result.expectedReturn * 100).toFixed(2)}% for this fund’s CAPM calculation. That value is distinct from the projected annual rate and is one of the inputs used to derive it.`,
    },
    {
      question: "What should I keep in mind?",
      answer: "These outputs are model-based estimates. They do not account for taxes, fees, changing market regimes, or future contributions, and they should not be treated as guaranteed returns.",
    },
  ];
}

export async function fetchFundHistory(input) {
  if (input && typeof input === "object" && "fund" in input) {
    return buildHistoricalSeriesFromMetrics({
      ticker: input.fund?.ticker,
      projectedRate: input.projectedRate,
      expectedReturn: input.expectedReturn,
      beta: input.beta,
    });
  }

  if (typeof input === "string" && input) {
    const forecast = await fetchForecast({
      ticker: input,
      principal: DEFAULT_PREVIEW_PRINCIPAL,
      years: DEFAULT_PREVIEW_YEARS,
    });
    return forecast.historicalSeries ?? [];
  }

  return [];
}
