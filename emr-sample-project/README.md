# EMR Sample – Deployable Demo (API + UI + Tests)

A minimal, deployable Electronic Medical Record (EMR) demo with:
- **Node/Express** backend with **SQLite** storage
- Simple **HTML/JS UI** served by the backend
- **API tests (Karate)** and **UI tests (Selenium + TestNG)**

## Quick Start
1) **Run with Docker Compose** (requires Docker):
```bash
docker compose up --build
```
Visit: http://localhost:8080

2) **Run locally without Docker**:
```bash
cd backend
npm install
npm start
```

## API Endpoints (examples)
- GET `/api/patients`
- POST `/api/patients` → `{ firstName, lastName, dob?, insuranceId? }`
- GET `/api/patients/:id`
- GET/POST `/api/patients/:id/medications`
- GET/POST `/api/patients/:id/labs`
- GET/POST `/api/patients/:id/notes`
- POST `/api/claims/submit` → `{ patientId, amount, code? }`

## Tests
### Karate (API)
```bash
cd tests/api-karate
mvn test
```

### Selenium + TestNG (UI)
```bash
cd tests/ui-selenium
mvn test
```

> Note: Selenium runs Chrome headless via Selenium Manager. Make sure Java 17+ is installed.

## Compliance Note
This is a demo app. Do **not** use real PHI. For HIPAA-safe demos only.
