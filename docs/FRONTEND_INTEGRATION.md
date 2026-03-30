# Frontend (React) — integration notes

Short reference for anyone wiring the Spring API to the Vite app in `frontend/`.

---

## What to call

| API | Frontend consumer |
|-----|-------------------|
| `GET /api/v1/funds` | Dropdowns (`Calculator`, `CompareFunds`) via `fetchFunds()` in [`api.js`](../frontend/src/lib/api.js) |
| `GET /api/v1/calculations/future-value` | Main projection via `fetchForecast()` in [`api.js`](../frontend/src/lib/api.js) |

**Query params for future value:** `ticker`, `initialInvestment`, `years` — the UI labels “principal” in the form, but the **API parameter name is `initialInvestment`**.

**Funds response:** JSON wraps the list in **`funds`** (`FundListResponse`). The mock today returns a plain array; when integrating, unwrap `response.funds` in `api.js`.

---

## Mapping server → UI

The results screen expects a **`CalculationResult`** ([`types.js`](../frontend/src/lib/types.js)):

| Server (`FutureValueResponse`) | UI field |
|--------------------------------|----------|
| `initialInvestment` | `principal` |
| `annualRate` | `projectedRate` |
| `expectedReturnRate` | `expectedReturn` |
| `ticker` + `fundName` | `fund`: `{ ticker, name, … }` |

**Not in the API yet:** `scenarios` (three cards) and `yearlyValues` (charts). The app can **derive** these in `api.js` from `annualRate` until the backend adds them.

---

## CORS & errors

- **CORS:** [`WebConfig`](../backend/src/main/java/com/group13/mutualfundcalculatorbackend/config/WebConfig.java) must allow the frontend origin (e.g. `http://localhost:5173`).
- **Errors:** Use `ErrorResponse` JSON; the client should surface **`message`** on 400 / 404 / 503.

**Env (when using real `fetch`):** e.g. `VITE_API_BASE_URL=http://localhost:8080` — build paths as `/api/v1/...`.

---

## Not part of MVP (still mock / client-only)

Compare funds, saved history, AI-style explanations, portfolio (`localStorage`), and optional **historical** series for charts — see [`historicalSeries.js`](../frontend/src/lib/historicalSeries.js) if you add a history endpoint later.

---

## Related

- Backend plan: [`Plan.md`](../Plan.md)
- DTOs: `backend/.../dto/FundResponse.java`, `FundListResponse.java`, `FutureValueResponse.java`

The older [`mutual_fund_calculator_TSD.md`](../mutual_fund_calculator_TSD.md) does not match the Spring MVP; follow the controllers and this doc instead.
