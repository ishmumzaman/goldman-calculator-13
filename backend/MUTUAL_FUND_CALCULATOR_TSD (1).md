# Mutual Fund Calculator - Technical Specification Document (TSD)

## 1. Purpose
This document translates the backend PRD into a simple implementation plan.

It is intentionally minimal. The goal is to build only what is required for the backend MVP and nothing extra.

## 2. Build Target
Implement the backend only for the Mutual Fund Calculator.

## 3. Frozen Technical Decisions
- Java 21
- Spring Boot 3.x
- Maven
- REST API
- JSON responses only
- No database
- No authentication
- No frontend work in this phase
- Frontend later will be React

## 4. Backend Responsibilities
The backend must provide:
- an endpoint to list supported mutual funds
- an endpoint to calculate future value
- integration with a beta source
- integration with a historical price source
- validation and JSON error handling

## 5. Recommended Project Structure
Keep the structure simple.

```text
com.group13.mutualfundcalculatorbackend
|-- MutualFundCalculatorBackendApplication.java
|-- config
|   |-- AppProperties.java
|   `-- WebConfig.java
|-- controller
|   |-- FundController.java
|   `-- CalculationController.java
|-- dto
|   |-- FundResponse.java
|   |-- FundListResponse.java
|   |-- FutureValueResponse.java
|   `-- ErrorResponse.java
|-- exception
|   |-- ResourceNotFoundException.java
|   |-- BadRequestException.java
|   |-- UpstreamDataException.java
|   `-- GlobalExceptionHandler.java
|-- model
|   `-- FundDefinition.java
|-- client
|   |-- BetaClient.java
|   `-- HistoricalPriceClient.java
`-- service
    |-- FundService.java
    `-- CalculationService.java
```

This exact package naming can be adjusted, but the implementation should stay small and layered.

## 6. Dependencies
Required dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-validation`
- `spring-boot-starter-test`

Optional:
- none required for MVP beyond the current scaffold

Do not add database dependencies.

## 7. Configuration
Use `application.properties`.

### 7.1 Required Config
The application must support configuration for:
- allowed frontend origin for later React connection
- hardcoded risk-free rate
- supported mutual fund list
- Newton Analytics beta settings
- Newton Analytics historical price settings

### 7.2 Example Config
```properties
server.port=8080

app.allowed-origin=http://localhost:5173
app.risk-free-rate=0.0435
app.benchmark-index-ticker=^GSPC

app.newton.base-url=https://api.newtonanalytics.com
app.newton.interval=1mo
app.newton.observations=12
app.newton.price-interval=1d
app.newton.price-data-type=04
app.newton.price-observations=800

app.funds[0].ticker=VFIAX
app.funds[0].name=Vanguard 500 Index Fund Admiral Shares
app.funds[0].family=Vanguard
app.funds[0].category=Large Blend
app.funds[0].benchmark-index-ticker=^GSPC

app.funds[1].ticker=FXAIX
app.funds[1].name=Fidelity 500 Index Fund
app.funds[1].family=Fidelity
app.funds[1].category=Large Blend
app.funds[1].benchmark-index-ticker=^GSPC

app.funds[2].ticker=SWPPX
app.funds[2].name=Schwab S&P 500 Index Fund
app.funds[2].family=Schwab
app.funds[2].category=Large Blend
app.funds[2].benchmark-index-ticker=^GSPC
```

## 8. Domain Model

### 8.1 FundDefinition
Fields:
- ticker
- name
- family
- category
- benchmarkIndexTicker

### 8.2 Calculation Inputs
Inputs required by the API:
- ticker
- initialInvestment
- years

### 8.3 Future Value Response
Fields:
- ticker
- fundName
- initialInvestment
- years
- riskFreeRate
- beta
- expectedReturnRate
- annualRate
- futureValue
- currency
- calculationTimestamp

## 9. API Design

### 9.1 GET /api/v1/funds
Purpose:
- return the configured list of supported mutual funds

Response shape:
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

### 9.2 GET /api/v1/calculations/future-value
Query parameters:
- `ticker`
- `initialInvestment`
- `years`

Example:
```text
GET /api/v1/calculations/future-value?ticker=VFIAX&initialInvestment=10000&years=5
```

Success response:
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

## 10. Calculation Logic

Interpretation note:
- The brief includes a FRED reference for the risk-free rate, but it also says to hardcode the risk-free rate. This implementation will use a configured hardcoded risk-free rate for MVP.
- The brief mentions S&P historical return over the past 5 years, but the more detailed backend instructions require calculating expected return from the selected mutual fund's last year of data. This implementation will use the selected mutual fund's previous full calendar year return.

### 10.1 Expected Return Rate
Use the previous full calendar year.

```text
expectedReturnRate = (lastTradingDayPrice - firstTradingDayPrice) / firstTradingDayPrice
```

### 10.2 Annual Rate
```text
annualRate = riskFreeRate + beta * (expectedReturnRate - riskFreeRate)
```

### 10.3 Future Value
```text
futureValue = principal * (1 + annualRate) ^ years
```

## 11. Service Design

### 11.1 FundService
Responsibilities:
- load the supported mutual fund list from config
- return all funds
- find a fund by ticker
- throw `ResourceNotFoundException` if unsupported

### 11.2 CalculationService
Responsibilities:
- validate request inputs
- load the selected fund
- use configured risk-free rate
- fetch beta from the beta client
- fetch historical price data from the historical price client
- calculate previous full calendar year return
- calculate annual rate and future value
- build the response DTO

## 12. External Integrations

### 12.1 Beta Client
Use the Newton Analytics beta API.

Required request parameters:
- ticker = selected mutual fund symbol
- index = `^GSPC`
- interval = `1mo`
- observations = `12`

The client must return a numeric beta value for the selected mutual fund.

### 12.2 Historical Price Client
Use the Newton Analytics stock price API to retrieve historical mutual fund daily prices.

Implementation requirements:
- request price data for the selected mutual fund
- isolate the previous full calendar year
- identify first and last trading day in that year
- compute expected return rate

Configuration keys required for runtime:
- `app.allowed-origin`
- `app.risk-free-rate`
- `app.benchmark-index-ticker`
- `app.newton.base-url`
- `app.newton.interval`
- `app.newton.observations`
- `app.newton.price-interval`
- `app.newton.price-data-type`
- `app.newton.price-observations`

## 13. Validation Rules
- `ticker` is required
- `ticker` must be in the supported fund list
- `initialInvestment` is required
- `initialInvestment` must be greater than 0
- `years` is required
- `years` must be an integer
- `years` must be greater than 0

## 14. Error Handling
Use JSON error responses with this shape:

```json
{
  "timestamp": "2026-03-21T15:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "years must be a positive integer",
  "path": "/api/v1/calculations/future-value"
}
```

Status rules:
- `400` for invalid input
- `404` for unsupported ticker
- `503` for upstream data/provider failure
- `500` for unexpected server errors

## 15. CORS
Add basic CORS support for later React integration.

Allowed origin:
- value from config
- default should match local React development, for example `http://localhost:5173`

Allowed methods:
- `GET`
- `OPTIONS`

## 16. Testing
Keep testing simple and focused.

Minimum required tests:
1. returns the configured fund list
2. calculates future value with mocked upstream data
3. rejects unsupported ticker
4. rejects non-positive investment amount
5. rejects invalid years
6. returns `503` when beta retrieval fails
7. returns `503` when historical price retrieval fails

Tests must not call live external APIs.

## 17. Implementation Order
Implement in this order:
1. create Spring Boot project
2. add config for funds and risk-free rate
3. implement `GET /api/v1/funds`
4. implement beta client
5. implement historical price client
6. implement calculation logic
7. implement `GET /api/v1/calculations/future-value`
8. add JSON exception handling
9. add tests

## 18. Definition of Done
The backend is done when:
- it builds on Java 21
- it starts without a database
- `/api/v1/funds` works
- `/api/v1/calculations/future-value` works
- the formula matches the PRD
- validation works
- JSON errors work
- the API is ready for later React integration
