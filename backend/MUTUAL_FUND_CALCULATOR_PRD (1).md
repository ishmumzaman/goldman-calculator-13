# Mutual Fund Calculator - Product Requirements Document (PRD)

## 1. Purpose
This document defines the backend MVP only.

It is intentionally limited to the requirements shown in the project screenshots. The goal is to build a simple backend now and connect it to a React frontend later.

## 2. Scope
Build a backend service that exposes REST APIs for:
- listing supported mutual funds
- calculating the projected future value of an investment

This phase is backend only.

## 3. Frozen Decisions
These decisions are fixed for this phase:
- Backend stack: Java 21 + Spring Boot
- Frontend later: React
- Do not use Angular
- Do not build frontend in this phase
- Do not add database
- Do not add authentication
- Do not add AI features
- Do not add comparison mode
- Do not add charts or graph endpoints
- Do not add saved calculations

## 4. Product Summary
The backend will help a client estimate the future value of an investment in a mutual fund.

The client will:
- choose a supported mutual fund
- enter an initial investment amount
- enter an investment duration in years
- receive a projected future value and the values used in the calculation

## 5. Formula Rules
Use this exact formula flow for the backend MVP.

Interpretation note:
- The project brief references the U.S. Treasury interest rate through the FRED link, but later explicitly says to hardcode the risk-free rate. For this MVP, the backend will use a configured hardcoded risk-free rate.
- The project brief also mentions S&P historical return over the past 5 years, but the detailed backend instructions later say to calculate expected return from the selected mutual fund's last year of data. For this MVP, expected return will be calculated from the selected mutual fund's previous full calendar year data.

### 5.1 Inputs
- `P` = principal = initial investment amount
- `t` = time in years
- `riskFreeRate` = configured hardcoded constant for this phase
- `beta` = selected mutual fund beta against the S&P 500
- `expectedReturnRate` = previous full calendar year return of the selected mutual fund

### 5.2 Expected Return Rate
Calculate expected return rate from the selected mutual fund's previous full calendar year data.

```text
expectedReturnRate = (lastTradingDayPrice - firstTradingDayPrice) / firstTradingDayPrice
```

Definitions:
- `firstTradingDayPrice` = first available trading day price in the previous full calendar year
- `lastTradingDayPrice` = last available trading day price in the previous full calendar year

### 5.3 Annual Rate
```text
annualRate = riskFreeRate + beta * (expectedReturnRate - riskFreeRate)
```

### 5.4 Future Value
```text
futureValue = P * (1 + annualRate) ^ t
```

## 6. Mutual Fund Rules
- The backend must use a hardcoded or config-driven list of mutual funds.
- Only funds in that list are supported.
- The selected funds should be ones that the beta source can support.
- Keep the list small for MVP.

## 7. Functional Requirements

### FR-1: List supported mutual funds
The backend must expose an endpoint that returns the list of supported mutual funds.

Each mutual fund entry must include:
- ticker
- name
- family
- category
- benchmark index ticker

### FR-2: Calculate future value
The backend must expose an endpoint that calculates future value.

Required inputs:
- mutual fund ticker
- initial investment amount
- years

The backend must:
- validate inputs
- verify the ticker is supported
- use the configured hardcoded risk-free rate
- get beta for the selected mutual fund
- calculate expected return rate from previous full calendar year data
- calculate annual rate
- calculate future value
- return the calculation breakdown as JSON

### FR-3: Beta source
The backend must get beta from the Newton Analytics beta API.

Required request settings:
- ticker = selected mutual fund symbol
- index = `^GSPC`
- interval = `1mo`
- observations = `12`

### FR-4: Historical return source
The backend must get enough historical mutual fund price data to calculate the previous full calendar year return.

The implementation uses the Newton Analytics stock price API for this historical mutual fund price data.

### FR-5: Input validation
Validation rules:
- `ticker` must be one of the supported mutual funds
- `initialInvestment` must be greater than 0
- `years` must be an integer
- `years` must be greater than 0

### FR-6: JSON only
The backend must return JSON responses only.

### FR-7: Backend-first
The backend must be usable and testable without any frontend.

## 8. Business Rules
- Benchmark index is the S&P 500
- Benchmark ticker is `^GSPC`
- Monetary values are in USD
- Use high precision internally for calculations
- Round money values in responses to 2 decimal places
- Round rate values in responses to 6 decimal places
- `years` is integer-only for MVP

## 9. Out of Scope
The following are out of scope for this backend phase:
- React frontend implementation
- Angular implementation
- user accounts
- authentication
- database or persistence
- bonus features from the brief
- AI challenge
- comparing multiple mutual funds
- saving calculations
- charts or historical graph endpoints

## 10. API Requirements

### 10.1 List Mutual Funds
Method:
```text
GET
```

Path:
```text
/api/v1/funds
```

Purpose:
Return the supported mutual fund catalog.

### 10.2 Calculate Future Value
Method:
```text
GET
```

Path:
```text
/api/v1/calculations/future-value
```

Query parameters:
- `ticker`
- `initialInvestment`
- `years`

Example:
```text
/api/v1/calculations/future-value?ticker=VFIAX&initialInvestment=10000&years=5
```

## 11. Response Requirements

### 11.1 Fund List Response
```json
{
  "funds": [
    {
      "ticker": "VFIAX",
      "name": "Vanguard 500 Index Fund Admiral Shares",
      "family": "Vanguard",
      "category": "Large Blend",
      "benchmarkIndexTicker": "^GSPC"
    }
  ]
}
```

### 11.2 Future Value Response
```json
{
  "ticker": "VFIAX",
  "fundName": "Vanguard 500 Index Fund Admiral Shares",
  "initialInvestment": 10000.00,
  "years": 5,
  "riskFreeRate": 0.043500,
  "beta": 0.980000,
  "expectedReturnRate": 0.120000,
  "annualRate": 0.118130,
  "futureValue": 17477.32,
  "currency": "USD",
  "calculationTimestamp": "2026-03-21T15:30:00Z"
}
```

### 11.3 Error Response
```json
{
  "timestamp": "2026-03-21T15:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "years must be a positive integer",
  "path": "/api/v1/calculations/future-value"
}
```

## 12. Acceptance Criteria

### AC-1: Fund list
Given the application is running,
when a client calls `GET /api/v1/funds`,
then the backend returns `200 OK` and a list of supported mutual funds.

### AC-2: Valid calculation
Given a supported mutual fund and valid inputs,
when a client calls `GET /api/v1/calculations/future-value`,
then the backend returns `200 OK` and the calculation breakdown.

### AC-3: Unsupported ticker
Given an unsupported mutual fund ticker,
when the future value endpoint is called,
then the backend returns `404 Not Found`.

### AC-4: Invalid amount
Given `initialInvestment <= 0`,
when the future value endpoint is called,
then the backend returns `400 Bad Request`.

### AC-5: Invalid years
Given a non-integer or non-positive `years` value,
when the future value endpoint is called,
then the backend returns `400 Bad Request`.

### AC-6: Upstream beta failure
Given the beta source fails,
when the future value endpoint is called,
then the backend returns `503 Service Unavailable`.

### AC-7: Upstream price-data failure
Given the historical price source fails or does not provide enough data for the previous full calendar year,
when the future value endpoint is called,
then the backend returns `503 Service Unavailable`.

## 13. Recommended Initial Fund List
Start with a small list of supported mutual funds such as:
- VFIAX
- FXAIX
- SWPPX

This list may be adjusted during implementation if a chosen ticker is not supported by the selected data sources.

## 14. Definition of Done
The backend MVP is complete when:
- the application builds with Java 21 and Spring Boot
- `GET /api/v1/funds` works
- `GET /api/v1/calculations/future-value` works
- the calculation uses the formula in this document
- invalid inputs return JSON errors
- upstream failures return JSON errors
- the backend can run without any frontend
- the API is ready to connect to a React frontend later
