# Mutual Fund Calculator Backend

## Requirements
- Java 21
- Maven 3.9+

This machine has both Java 8 and Java 21 installed. The backend must run on Java 21.

## Local Setup
PowerShell example:

```powershell
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot'
$env:Path="$env:JAVA_HOME\\bin;$env:Path"
```

Verify the toolchain:

```powershell
java -version
mvn -version
```

## Run Tests
```powershell
mvn test
```

## Start The Application
```powershell
mvn spring-boot:run
```

The service starts on `http://localhost:8080`.

## Runtime Configuration
The application uses `src/main/resources/application.properties`.

Relevant keys:
- `app.allowed-origin`
- `app.risk-free-rate`
- `app.benchmark-index-ticker`
- `app.newton.base-url`
- `app.newton.interval`
- `app.newton.observations`
- `app.newton.price-interval`
- `app.newton.price-data-type`
- `app.newton.price-observations`
- `app.funds[*]`

## API Endpoints
### Get Mutual Funds
```text
GET /api/v1/funds
```

`curl` example:

```bash
curl http://localhost:8080/api/v1/funds
```

PowerShell example:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/funds'
```

### Calculate Future Value
```text
GET /api/v1/calculations/future-value?ticker=VFIAX&initialInvestment=10000&years=5
```

`curl` example:

```bash
curl "http://localhost:8080/api/v1/calculations/future-value?ticker=VFIAX&initialInvestment=10000&years=5"
```

PowerShell example:

```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/calculations/future-value?ticker=VFIAX&initialInvestment=10000&years=5'
```

## Notes
- This backend is intentionally scoped to the MVP in the PRD and TSD.
- No database, authentication, or persistence is included.
- The frontend will connect to these endpoints later.
- Newton Analytics is used for both beta and historical price data.
- No API key is required for live future-value calculations with the current provider choice.
- `expectedReturnRate` is derived from the configured benchmark index's trailing 5-year return, while beta is still retrieved for the selected mutual fund.
