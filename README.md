# Calculator

Full-stack calculator: a **React + TypeScript** frontend that calls a **Go** REST microservice to do the math.

Supported operations: addition, subtraction, multiplication, division and square root.

```
calculadora/
├── backend/                 Go REST API (standard library only)
│   ├── main.go              HTTP server, routing, CORS, JSON handling
│   ├── calculator.go        Pure math logic (Calcular)
│   ├── calculator_test.go   Unit tests for the math logic
│   └── main_test.go         Tests for the HTTP handler
└── frontend/                React + TypeScript app (Vite)
    └── src/
        ├── api/             Backend client (fetch wrapper)
        ├── components/      Calculator UI component
        └── utils/           Operation list + input validation
```

## Requirements

- Go 1.27+
- Node.js 18+ and npm

## Setup and running

You need two terminals, one for each service.

**1. Backend** (runs on http://localhost:8080)

```bash
cd backend
go run .
```

**2. Frontend** (runs on http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in the browser.

In development, Vite proxies every `/api` request to `localhost:8080`, so you don't need to configure a URL or deal with CORS. To point the frontend at a different backend (for example, in production), set `VITE_API_URL` before building:

```bash
VITE_API_URL=https://my-api.example.com/api/calculate npm run build
```

## API

### `POST /api/calculate`

**Request body**

| Field       | Type   | Description                                                |
|-------------|--------|------------------------------------------------------------|
| `operation` | string | `add`, `subtract`, `multiply`, `divide` or `sqrt`          |
| `a`         | number | First operand                                              |
| `b`         | number | Second operand (ignored for `sqrt`)                        |

**Responses**

| Status | When                                                         | Body                                   |
|--------|--------------------------------------------------------------|----------------------------------------|
| 200    | Success                                                      | `{ "result": <number> }`               |
| 400    | Malformed JSON, wrong types, division by zero, negative sqrt, unknown operation | `{ "result": 0, "error": "<message>" }` |
| 405    | Any method other than `POST` / `OPTIONS`                     | plain text                             |

**Examples**

```bash
# addition
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":5,"b":3}'
# {"result":8}

# square root (b not needed)
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"sqrt","a":16}'
# {"result":4}

# division by zero
curl -X POST http://localhost:8080/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":0}'
# 400 {"result":0,"error":"La división por 0 no es permitida"}
```

User-facing error messages are in Spanish because the UI is in Spanish.

## Tests and coverage

**Backend**

```bash
cd backend
go test -v ./...                                  # run tests
go test -coverprofile=coverage.out ./...          # coverage
go tool cover -html=coverage.out -o coverage.html # HTML report
```

**Frontend**

```bash
cd frontend
npm test            # run tests
npm run coverage    # coverage (text + HTML in frontend/coverage/)
npm run typecheck   # TypeScript check
```

**Current coverage**

| Layer    | Statements | Notes                                                   |
|----------|-----------:|---------------------------------------------------------|
| Backend  | 88.9 %     | `Calcular` and the handler at 100 %; only `main()` is untested |
| Frontend | 100 %      | 94 % of branches                                         |

The HTML reports are in `backend/coverage.html` and `frontend/coverage/index.html`.

What's tested:

- **Go math logic**: every operation plus the error cases (division by zero, negative sqrt).
- **Go HTTP handler** (`httptest`): success response and JSON content type; 400 for malformed JSON, wrong types, math errors and unknown operations; 405 for wrong methods; CORS preflight.
- **Frontend validation**: valid numbers, empty/non-numeric input, division by zero, negative sqrt, unknown operation.
- **Frontend API client**: request body, backend error messages, non-JSON responses, server down.
- **Calculator component**: shows results, blocks invalid input before calling the API, hides the second input for sqrt, shows backend errors, the clear button.

## Design decisions

- **Math logic is separate from HTTP.** `Calcular` in `calculator.go` is a pure function with no HTTP dependency, so it can be tested with a simple table test. `main.go` only decodes the request, calls `Calcular` and encodes the response.
- **One endpoint with an `operation` field** instead of one endpoint per operation. The request shape is the same for every operation, so one handler covers all of them and adding an operation only touches `Calcular`.
- **Go standard library only.** `net/http` and `encoding/json` are enough for a single endpoint; a framework would add dependencies without much benefit.
- **Validation on both sides.** The frontend validates first for instant feedback and to avoid useless requests. The backend still validates everything, because it can't trust its clients.
- **Frontend in layers.** `api/` is the only code that knows about `fetch`; `utils/` holds pure functions (validation and the operation list); `components/` holds the UI. Each layer can be tested on its own, and the component tests mock the API so they run without the Go server.
- **Operations defined as data.** The buttons are generated from the `OPERATIONS` list, so adding an operation in the UI is one line there.
- **Inputs stored as strings.** This lets the user type partial values like `-` or `2.` and keeps validation in one place.
- **Responsive and accessible.** A single card layout that fills the screen on mobile (max 400px on desktop), `inputMode="decimal"` for the numeric keyboard on phones, labeled inputs, `aria-pressed` on the operation buttons and `aria-live` on the result.
