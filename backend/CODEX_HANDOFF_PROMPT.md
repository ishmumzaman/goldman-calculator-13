# Codex Handoff Prompt

Use the attached PRD and TSD as the source of truth.

Your task is to build the **backend MVP only** for the Mutual Fund Calculator project.

## Hard Rules
- Use **Java 21**.
- Use **Spring Boot**.
- Use **Maven**.
- Build the **backend first**.
- Do **not** build the React frontend yet.
- Do **not** add Angular.
- Do **not** add a database.
- Do **not** add authentication.
- Do **not** add AI/OpenAI features.
- Do **not** add portfolio optimization.
- Do **not** expand scope beyond the PRD/TSD.

## Deliverables
1. A working Spring Boot backend project.
2. `GET /api/v1/funds`
3. `GET /api/v1/calculations/future-value?ticker=...&initialInvestment=...&years=...`
4. Clean DTOs, services, clients, config classes, and exception handling.
5. Unit and integration tests.
6. README with local setup instructions.

## Implementation Guidance
- Follow the implementation order from the TSD.
- Use config-driven hardcoded mutual funds from `application.yml`.
- Wrap all external API logic in client/service classes.
- Add fallback behavior for beta and previous-year return when live APIs fail.
- Return consistent JSON error responses.
- Keep the code clean, simple, and interview-ready.

## Output Format
When you generate code, produce:
- full file tree
- complete file contents
- any required env vars
- exact run commands
- exact test commands

## Final Check Before You Finish
Verify that:
- the app builds on Java 21
- no database dependency exists
- no frontend code was added
- the two required endpoints work
- tests do not call live APIs
- the implementation matches the PRD and TSD exactly
