# Mutual Fund Calculator — Product Requirements Document (PRD)

## 1. Overview

**Product name:** Mutual Fund Calculator  
**Type:** Web application  
**Primary goal:** Help users estimate the future value of a mutual fund investment using historical return data, fund beta, risk-free rate inputs, and simple scenario modeling.

This project starts from the required baseline but improves it into a more polished, more realistic, and more differentiated product that still fits a student build scope.

The app should feel like a lightweight investor exploration tool, not just a single formula page.

---

## 2. Why this version stands out

The baseline asks for:
- mutual fund selection
- initial investment input
- time horizon input
- future value calculation
- backend APIs
- frontend UI

To stand out while keeping the build realistic, the product will add:

1. **Scenario analysis**
   - Base case
   - Conservative case
   - Optimistic case

2. **Fund comparison**
   - Compare 2–3 mutual funds side by side

3. **Explainability panel**
   - Show exactly what drove the result:
     - risk-free rate
     - beta
     - expected market return
     - projected rate used
     - formula breakdown

4. **Historical charting**
   - Show past fund performance trend
   - Show projected growth curve

5. **Input validation and investor-friendly UX**
   - Friendly errors
   - Empty-state guidance
   - Units and assumptions clearly labeled

6. **Saved calculations history**
   - Save prior runs locally or in a database
   - Makes the project feel like a real product instead of a one-off calculator

7. **Optional AI layer**
   - Natural-language explanation of results
   - Example: “This projection is higher mainly because the selected fund has a beta above 1 and the expected return estimate is stronger than the risk-free rate.”
   - This is realistic and useful, unlike forced AI features

---

## 3. Problem Statement

New or intermediate investors often do not understand:
- how mutual fund projections are estimated
- how risk, beta, and expected return affect projections
- how one fund compares against another
- how different assumptions change future outcomes

A basic calculator gives a number, but it does not build trust or insight.

This product solves that by giving users:
- a projection
- the assumptions behind it
- comparison tools
- scenario-based exploration
- simple explanations

---

## 4. Target Users

### Primary users
- students learning finance or investing
- beginner investors
- users who want a simple planning tool for mutual fund investing

### Secondary users
- instructors evaluating the project
- recruiters reviewing engineering scope and product thinking
- hackathon/judging audiences looking for polish and differentiation

---

## 5. Goals

### Business / showcase goals
- Build a polished full-stack project
- Demonstrate backend API design, external API integration, data modeling, and frontend visualization
- Show product thinking beyond minimum requirements
- Make the final demo memorable and easy to understand

### User goals
- estimate future investment value
- compare funds
- understand why projections differ
- explore different time horizons and assumptions
- review previous calculations

---

## 6. Non-Goals

The app will **not**:
- provide live trading
- provide financial advice
- guarantee future returns
- support every mutual fund in the market in V1
- implement highly advanced portfolio optimization in core MVP
- replace professional investment research tools

---

## 7. Product Scope

## 7.1 MVP Scope

### Core inputs
- mutual fund selection from supported list
- initial investment amount
- investment horizon in years

### Core outputs
- projected future value
- projected annualized rate used
- beta
- risk-free rate
- expected return estimate
- formula explanation

### Core pages / views
1. **Calculator page**
2. **Results page or results section**
3. **Fund comparison view**
4. **Saved history view** (lightweight)

---

## 7.2 Standout Features in V1

### A. Scenario Forecasting
For each calculation, show:
- Conservative
- Base
- Optimistic

This makes the product more realistic because finance projections should not look like one guaranteed number.

**Example approach**
- Conservative = expected return minus adjustment buffer
- Base = direct model estimate
- Optimistic = expected return plus adjustment buffer

### B. Compare Funds
Let the user choose up to 3 funds and compare:
- beta
- historical return estimate
- projected rate
- future value after X years

### C. Visuals
- line chart of historical adjusted closing prices or normalized growth
- line chart of projected value over time
- comparison bar chart for final future values

### D. Explainability
A dedicated section that answers:
- What rate did we use?
- How was that rate estimated?
- Why is this fund more/less aggressive?
- What assumptions should the user know?

### E. Calculation History
Save:
- fund selected
- principal
- time horizon
- scenario outputs
- timestamp

### F. AI Insight Summary (optional but strong)
Generate a short explanation:
- plain English summary of projection
- risk interpretation
- comparison takeaway

This should be behind a button like **“Explain this result”**.

---

## 8. User Stories

### Core stories
- As a user, I want to choose a mutual fund so I can estimate returns for a real investment option.
- As a user, I want to enter an amount and time horizon so I can see future value projections.
- As a user, I want to understand how the result was calculated so I can trust the output.
- As a user, I want to compare multiple funds so I can evaluate tradeoffs.

### Enhanced stories
- As a user, I want to see optimistic and conservative scenarios so I can understand uncertainty.
- As a user, I want to view historical fund data so I can connect the forecast to past behavior.
- As a user, I want to save previous calculations so I can revisit and compare them later.
- As a user, I want a simple explanation of the result so I do not need finance expertise to interpret it.

---

## 9. Functional Requirements

## 9.1 Fund Catalog
The system shall:
- provide a supported list of mutual funds
- store ticker, display name, category, and provider metadata
- show only funds with required data availability

## 9.2 Calculation Engine
The system shall:
- accept principal, fund, and time horizon
- fetch or load beta for the selected fund
- fetch or load risk-free rate
- estimate expected return
- calculate projected rate
- calculate future value
- return structured results

## 9.3 Scenario Engine
The system shall:
- compute conservative, base, and optimistic scenarios
- clearly label assumptions
- show the scenario spread visually

## 9.4 Comparison
The system shall:
- allow comparing up to 3 funds
- calculate identical-horizon outputs for each fund
- display results in a table and chart

## 9.5 Historical Data
The system shall:
- fetch historical fund price data
- compute annual or trailing return metrics
- render historical charts

## 9.6 Saved Calculations
The system shall:
- store calculation history
- allow the user to revisit a prior record
- optionally persist to database or local storage

## 9.7 AI Explanation
If enabled, the system shall:
- generate a short plain-English explanation
- use result data as context
- avoid making advice-like promises

---

## 10. UX Requirements

The app should:
- feel clean and professional
- minimize finance jargon where possible
- include tooltips for beta, expected return, and risk-free rate
- show assumptions before or near the result
- display warnings when data is unavailable
- use responsive layout
- clearly separate **estimate** from **guarantee**

### Key UX details
- currency formatting for dollar values
- percentages formatted consistently
- disabled submit button until valid inputs are entered
- loading states during external API calls
- fallback messaging when an API fails

---

## 11. Success Metrics

### Product success
- user can complete a calculation in under 30 seconds
- comparison feature works smoothly for at least 2 funds
- charts render for supported funds
- users understand the assumptions behind the result

### Technical success
- API response time is acceptable for demo use
- app handles invalid inputs and API failures gracefully
- calculation output is reproducible and consistent
- codebase is modular and demo-ready

### Demo success
- judges/reviewers can quickly see:
  - baseline requirement coverage
  - additional value beyond calculator
  - technical depth
  - polished UX

---

## 12. Risks and Mitigations

### Risk: external market APIs are unreliable
**Mitigation:**  
- cache supported fund metadata and beta values
- use fallback mock/sample data for demo continuity

### Risk: model assumptions are oversimplified
**Mitigation:**  
- label clearly as educational projection
- expose assumptions in UI
- show scenarios instead of single certainty

### Risk: scope becomes too large
**Mitigation:**  
Prioritize in this order:
1. calculator
2. explainability
3. comparison
4. charts
5. saved history
6. AI explanation

---

## 13. Release Plan

## Phase 1 — Core MVP
- fund dropdown
- investment amount input
- time horizon input
- base projection API
- result display

## Phase 2 — Strong polish
- comparison table
- charts
- scenario analysis
- assumption breakdown

## Phase 3 — Standout extras
- saved calculations
- AI explanation
- better design polish
- presentation/demo story

---

## 14. Suggested Demo Flow

1. Select a mutual fund
2. Enter $10,000 and 10 years
3. Show base, conservative, optimistic outcomes
4. Open explanation panel
5. Compare against 2 other funds
6. Show historical trend chart
7. Save the calculation
8. Trigger AI explanation summary

This tells a much better story than only returning one future value number.

---

## 15. Final Recommended Feature Set

## Must-have
- fund selection
- future value calculation
- beta + expected return usage
- clean UI
- backend API integration

## Should-have
- comparison
- scenario analysis
- historical chart
- explanation breakdown

## Nice-to-have
- saved history in DB
- AI explanation
- export/share result

---

## 16. Summary

The strongest realistic version of this project is:

**“A mutual fund analysis and projection tool that not only estimates future value, but also compares funds, explains assumptions, visualizes trends, and helps users understand risk through scenarios.”**

That is still very buildable, but it feels much more serious and impressive than a plain calculator.
