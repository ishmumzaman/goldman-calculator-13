# Mutual Fund Calculator — Technical Specification Document (TSD)

## 1. Technical Overview

This application is a full-stack web app that allows users to:
- select a mutual fund
- enter an initial investment amount
- enter an investment horizon
- retrieve fund metadata and market inputs
- calculate projected future values
- compare funds
- review scenarios
- view historical trends
- optionally save calculations and generate AI-based explanations

The system should be modular, easy to demo, and safe against API instability.

---

## 2. Recommended Tech Stack

## Frontend
- **Next.js** or **React**
- TypeScript
- Tailwind CSS
- Recharts or Chart.js for visualizations

## Backend
- **FastAPI**
- Python 3.11+
- Pydantic
- httpx for external API calls

## Database
Choose one:
- **Supabase Postgres** for saved calculations and supported funds metadata
- or local JSON/mock storage for lighter scope

## External APIs
- market/fund data provider for historical prices
- beta provider (like Newton Analytics if available)
- risk-free rate source (Treasury/FRED)
- optional LLM API for AI explanation

---

## 3. Architecture

## 3.1 High-Level Architecture

```text
Frontend (React / Next.js)
    |
    v
FastAPI Backend
    |
    |-- Fund Catalog Service
    |-- Market Data Service
    |-- Beta Service
    |-- Forecast Engine
    |-- Comparison Service
    |-- History Service
    |-- AI Explanation Service (optional)
    |
    v
Supabase / Postgres
```

---

## 3.2 Architectural Principles

- keep calculation logic in backend
- keep external API integration isolated in service modules
- use typed request/response models
- support mock fallback data for demos
- keep frontend mostly presentation + orchestration
- separate raw market data retrieval from computed forecast logic

---

## 4. Core Domain Model

## 4.1 Main Entities

### Fund
- id
- ticker
- name
- category
- provider
- benchmark_index
- supported (boolean)

### FundMarketSnapshot
- fund_id
- beta
- beta_source
- expected_return
- expected_return_method
- risk_free_rate
- as_of_date

### CalculationRequest
- fund_id or ticker
- principal
- years

### ScenarioResult
- scenario_name
- projected_rate
- future_value

### CalculationResult
- fund
- principal
- years
- beta
- expected_return
- risk_free_rate
- projected_rate
- future_value
- scenarios[]
- assumptions[]
- generated_at

### SavedCalculation
- id
- user_session_id or anonymous key
- fund_id
- principal
- years
- result_payload
- created_at

---

## 5. Forecasting Logic

## 5.1 Baseline Formula

Use the provided exponential growth structure:

```text
FV = P * e^(r * t)
```

Where:
- `P` = principal
- `r` = projected annual rate
- `t` = years

## 5.2 Projected Rate

Use CAPM-style logic from the project brief:

```text
r = rf + beta * (expected_market_return - rf)
```

Where:
- `rf` = risk-free rate
- `beta` = mutual fund beta
- `expected_market_return` = estimated market or fund-linked expected return

## 5.3 Practical Recommendation

For clarity and realism, support **two modes** in backend design:

### Mode A — Brief-aligned mode
Directly follows the project instructions.

### Mode B — Fund-informed mode
Use:
- risk-free rate
- market return estimate
- beta
- recent fund performance metrics

This lets the team explain that the estimate blends classroom finance logic with practical historical data.

## 5.4 Scenario Logic

Recommended simple scenario adjustments:

```text
conservative_rate = max(base_rate - 0.02, 0)
base_rate = calculated_rate
optimistic_rate = base_rate + 0.02
```

Alternative:
- derive buffers from historical volatility if available

Keep V1 simple and clearly documented.

---

## 6. Data Sources and Fallback Strategy

## 6.1 Supported Inputs Needed
- fund list
- fund beta
- historical fund prices
- risk-free rate

## 6.2 Recommended Source Strategy

### Fund catalog
- seed manually in DB or config file
- only include supported funds with valid downstream data

### Beta
- external API if available
- cache results daily
- fallback to seeded beta in DB

### Historical prices / return estimates
- external API
- fallback to stored sample data for demo funds

### Risk-free rate
- FRED or seeded config value
- cache daily

## 6.3 Demo Reliability Strategy

For demo stability:
- pre-support 5–10 funds
- cache all required values ahead of time
- allow mock mode using local fixtures if APIs fail

This is important because live API failures can ruin a demo.

---

## 7. API Design

## 7.1 API Conventions
- JSON request/response
- version prefix: `/api/v1`
- clear error payloads
- typed schemas via Pydantic

---

## 7.2 Endpoints

### 1. Get supported funds
**GET** `/api/v1/funds`

#### Response
```json
[
  {
    "id": "vfiax",
    "ticker": "VFIAX",
    "name": "Vanguard 500 Index Fund Admiral Shares",
    "category": "Large Blend",
    "provider": "Vanguard"
  }
]
```

---

### 2. Get fund details
**GET** `/api/v1/funds/{ticker}`

#### Response
```json
{
  "id": "vfiax",
  "ticker": "VFIAX",
  "name": "Vanguard 500 Index Fund Admiral Shares",
  "category": "Large Blend",
  "provider": "Vanguard",
  "beta": 1.01,
  "risk_free_rate": 0.042,
  "expected_return": 0.081,
  "as_of_date": "2026-03-14"
}
```

---

### 3. Calculate forecast
**POST** `/api/v1/forecast`

#### Request
```json
{
  "ticker": "VFIAX",
  "principal": 10000,
  "years": 10
}
```

#### Response
```json
{
  "ticker": "VFIAX",
  "principal": 10000,
  "years": 10,
  "beta": 1.01,
  "risk_free_rate": 0.042,
  "expected_return": 0.081,
  "projected_rate": 0.08139,
  "future_value": 22571.33,
  "scenarios": [
    {
      "scenario_name": "conservative",
      "projected_rate": 0.06139,
      "future_value": 18479.52
    },
    {
      "scenario_name": "base",
      "projected_rate": 0.08139,
      "future_value": 22571.33
    },
    {
      "scenario_name": "optimistic",
      "projected_rate": 0.10139,
      "future_value": 27582.17
    }
  ],
  "assumptions": [
    "Projection is educational and not guaranteed.",
    "Risk-free rate is cached daily.",
    "Scenario buffers are fixed in V1."
  ]
}
```

---

### 4. Compare funds
**POST** `/api/v1/compare`

#### Request
```json
{
  "tickers": ["VFIAX", "SWPPX", "FXAIX"],
  "principal": 10000,
  "years": 10
}
```

#### Response
```json
{
  "principal": 10000,
  "years": 10,
  "results": [
    {
      "ticker": "VFIAX",
      "future_value": 22571.33,
      "projected_rate": 0.08139,
      "beta": 1.01
    }
  ]
}
```

---

### 5. Get historical data
**GET** `/api/v1/funds/{ticker}/history?range=5y`

#### Response
```json
{
  "ticker": "VFIAX",
  "range": "5y",
  "points": [
    { "date": "2021-01-01", "price": 100.0 },
    { "date": "2021-02-01", "price": 101.5 }
  ]
}
```

---

### 6. Save calculation
**POST** `/api/v1/history`

#### Request
```json
{
  "ticker": "VFIAX",
  "principal": 10000,
  "years": 10,
  "result_payload": {}
}
```

#### Response
```json
{
  "id": "calc_123",
  "status": "saved"
}
```

---

### 7. Get saved calculations
**GET** `/api/v1/history`

#### Response
```json
[
  {
    "id": "calc_123",
    "ticker": "VFIAX",
    "principal": 10000,
    "years": 10,
    "created_at": "2026-03-14T12:00:00Z"
  }
]
```

---

### 8. AI explanation (optional)
**POST** `/api/v1/explain`

#### Request
```json
{
  "ticker": "VFIAX",
  "principal": 10000,
  "years": 10,
  "future_value": 22571.33,
  "beta": 1.01,
  "projected_rate": 0.08139
}
```

#### Response
```json
{
  "summary": "This projection is driven by a market-like beta and a projected annual return above the risk-free rate. The scenarios show moderate sensitivity to return assumptions."
}
```

---

## 8. Backend Module Design

Suggested folder structure:

```text
backend/
  app/
    main.py
    api/
      routes/
        funds.py
        forecast.py
        compare.py
        history.py
        explain.py
    core/
      config.py
      logging.py
    models/
      schemas.py
      db_models.py
    services/
      fund_service.py
      market_data_service.py
      beta_service.py
      risk_free_service.py
      forecast_service.py
      compare_service.py
      history_service.py
      explain_service.py
    repositories/
      fund_repository.py
      history_repository.py
    utils/
      math_utils.py
      cache.py
      fixtures.py
```

### Service responsibilities

#### `fund_service.py`
- fetch supported funds
- fetch fund metadata

#### `beta_service.py`
- fetch beta from provider
- cache result
- fallback to seeded value

#### `risk_free_service.py`
- fetch treasury/FRED value
- cache daily
- fallback to config

#### `market_data_service.py`
- fetch historical prices
- compute trailing return metrics

#### `forecast_service.py`
- compute base rate
- compute scenarios
- return final response payload

#### `compare_service.py`
- run forecast across multiple funds
- normalize result format

#### `history_service.py`
- persist and retrieve saved calculations

#### `explain_service.py`
- build prompt
- call LLM provider
- sanitize and return explanation

---

## 9. Frontend Design

## 9.1 Main Screens

### A. Home / Calculator
Components:
- FundSelector
- InvestmentInput
- TimeHorizonInput
- CalculateButton
- AssumptionsNotice

### B. Results Section
Components:
- ResultCard
- ScenarioCards
- FormulaBreakdown
- ProjectionChart

### C. Comparison View
Components:
- CompareFundSelector
- ComparisonTable
- ComparisonChart

### D. History View
Components:
- SavedCalculationList
- CalculationDetailDrawer

### E. AI Insight Panel
Components:
- ExplainButton
- AIInsightCard

---

## 9.2 Suggested Frontend Folder Structure

```text
frontend/
  src/
    app/ or pages/
    components/
      FundSelector.tsx
      InvestmentForm.tsx
      ResultCard.tsx
      ScenarioTable.tsx
      ProjectionChart.tsx
      HistoricalChart.tsx
      ComparisonTable.tsx
      AIInsightCard.tsx
    lib/
      api.ts
      format.ts
    types/
      api.ts
```

---

## 10. Database Design

If using Supabase/Postgres, recommended tables:

## 10.1 `funds`
```sql
create table funds (
  id uuid primary key default gen_random_uuid(),
  ticker text unique not null,
  name text not null,
  category text,
  provider text,
  benchmark_index text,
  seeded_beta numeric,
  supported boolean default true,
  created_at timestamptz default now()
);
```

## 10.2 `saved_calculations`
```sql
create table saved_calculations (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  ticker text not null,
  principal numeric not null,
  years integer not null,
  result_payload jsonb not null,
  created_at timestamptz default now()
);
```

## 10.3 Optional `market_snapshots`
```sql
create table market_snapshots (
  id uuid primary key default gen_random_uuid(),
  ticker text not null,
  beta numeric,
  expected_return numeric,
  risk_free_rate numeric,
  as_of_date date not null,
  raw_payload jsonb,
  created_at timestamptz default now()
);
```

---

## 11. Validation Rules

### Input validation
- principal must be greater than 0
- years must be an integer or decimal greater than 0
- ticker must be supported
- comparison request must contain 2–3 tickers

### Backend validation
- reject incomplete external data unless fallback exists
- return safe error messages
- log upstream API failures

### UI validation
- inline form errors
- prevent submit when invalid
- display clear “data temporarily unavailable” state

---

## 12. Error Handling

Standard error response:

```json
{
  "error": {
    "code": "UPSTREAM_DATA_UNAVAILABLE",
    "message": "We could not retrieve data for the selected fund right now.",
    "details": null
  }
}
```

Common errors:
- invalid ticker
- invalid amount
- invalid years
- upstream beta fetch failure
- upstream historical data failure
- DB write failure

---

## 13. Caching Strategy

Use caching for:
- supported funds
- risk-free rate
- beta values
- historical data for demo funds

Suggested TTL:
- risk-free rate: 24 hours
- beta: 24 hours
- historical fund data: 12 to 24 hours
- supported fund catalog: long-lived

This reduces latency and protects the demo from API instability.

---

## 14. Security and Compliance Notes

Because this is an educational project:
- do not store sensitive financial account data
- do not present output as professional financial advice
- rate-limit optional explanation endpoint if using paid AI API
- keep secrets in environment variables
- do not expose provider API keys in frontend

Environment variables:
- `BETA_API_KEY`
- `MARKET_DATA_API_KEY`
- `OPENAI_API_KEY` or equivalent
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## 15. Testing Strategy

## 15.1 Backend Tests
- unit tests for forecast math
- unit tests for scenario generation
- integration tests for API routes
- service tests with mocked external providers

### Critical test cases
- valid forecast request
- unsupported ticker
- zero or negative principal
- API failure with fallback success
- API failure with no fallback
- compare endpoint with 1, 2, 3, and 4 funds

## 15.2 Frontend Tests
- form validation tests
- result rendering tests
- loading state tests
- error state tests
- comparison flow tests

## 15.3 Demo Readiness Tests
- pre-demo sanity check with all supported demo funds
- verify charts load
- verify save calculation works
- verify optional AI summary works or hides gracefully

---

## 16. Performance Expectations

For demo use:
- common GET endpoints should feel near-instant with cache
- forecast endpoint should usually return within 1–2 seconds
- comparison endpoint should remain responsive for 3 funds
- charts should render smoothly on laptop browser

---

## 17. Implementation Plan

## Sprint 1
- set up repo
- define schemas
- seed supported fund list
- build `/funds` and `/forecast`

## Sprint 2
- integrate beta/risk-free/historical services
- add scenario logic
- build frontend calculator + results

## Sprint 3
- build compare endpoint and UI
- add charts
- add improved assumption display

## Sprint 4
- add saved calculations
- add optional AI explanation
- polish demo, error states, and presentation

---

## 18. Recommended MVP Cut Line

If time gets tight, do this minimum strong version:

### Keep
- supported funds endpoint
- forecast endpoint
- scenario outputs
- explanation breakdown
- polished frontend result cards
- one historical chart
- compare 2 funds

### Cut first
- authentication
- advanced portfolio optimization
- many database tables
- over-complicated AI features

---

## 19. Final Technical Recommendation

The most realistic impressive build is:

- **React/Next frontend**
- **FastAPI backend**
- **Supabase for saved history + seeded fund metadata**
- **cached external API integrations**
- **scenario engine**
- **comparison endpoint**
- **historical + projected charts**
- **optional AI explanation**

That gives you:
- strong backend story
- clean frontend story
- clear product depth
- realistic scope
- strong demo value
