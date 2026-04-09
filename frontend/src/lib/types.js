/**
 * @typedef {Object} Fund
 * @property {string} ticker
 * @property {string} name
 * @property {string} family
 * @property {string} category
 * @property {string} benchmarkIndexTicker
 */

/**
 * @typedef {Object} ScenarioResult
 * @property {'conservative' | 'base' | 'optimistic'} scenario
 * @property {number} rate
 * @property {number} futureValue
 */

/**
 * @typedef {Object} HistoryPoint
 * @property {number} month
 * @property {number} value
 */

/**
 * Series passed into `HistoricalChart` / `normalizeHistoricalLineData`.
 * Mock data uses {@link HistoryPoint}[]; a real backend may return other row shapes
 * or wrappers (`{ data, points, series, values, items, rows }`) — see `lib/historicalSeries.js`.
 *
 * @typedef {HistoryPoint[]|Record<string, unknown>} HistoricalSeriesInput
 */

/**
 * @typedef {Object} CalculationResult
 * @property {Fund} fund
 * @property {number} principal
 * @property {number} years
 * @property {number} projectedRate
 * @property {number} futureValue
 * @property {number} riskFreeRate
 * @property {number} beta
 * @property {number} expectedReturn
 * @property {ScenarioResult[]} scenarios
 * @property {number[]} yearlyValues
 * @property {HistoricalSeriesInput} [historicalSeries] history for charts (same run as forecast)
 */

/**
 * @typedef {Object} HistoryItem
 * @property {string} id
 * @property {string} fundName
 * @property {string} ticker
 * @property {number} principal
 * @property {number} years
 * @property {number} conservative
 * @property {number} base
 * @property {number} optimistic
 * @property {string} date
 * @property {'gain' | 'loss'} status
 * @property {CalculationResult} [result]
 */

/**
 * @typedef {Object} PortfolioHolding
 * @property {string} ticker
 * @property {string} name
 * @property {number} principal
 * @property {number} years
 * @property {number} projRate
 * @property {number} futureValue
 * @property {string} color
 */

/**
 * @typedef {Object} ExplainabilityItem
 * @property {string} question
 * @property {string} answer
 */

export {};
