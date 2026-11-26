# Sweety – Blood Glucose Tracker

Sweety is a full-stack web app for people with diabetes to record up to four blood glucose readings a day, review daily and monthly reports, plan meals, and keep track of doctor appointments.

**Live demo:** https://sweety-web-3nao.onrender.com (hosted on Render's free plan, so the first load after a quiet spell can take up to a minute). Register an account, then open **Profile → Add sample data** to see the charts filled in.

It is built with a **React (Vite) frontend**, a **Node.js + Express REST API** and a **PostgreSQL** database accessed through **Prisma**.

> Sweety records and summarises measurements only. It does not provide diagnoses, treatment advice or medical recommendations.

![Dashboard](docs/screenshots/02-dashboard.png)

---

## Contents

1. [Features](#features)
2. [Technology stack](#technology-stack)
3. [Architecture](#architecture)
4. [Folder structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Installation and setup](#installation-and-setup)
7. [Running the app](#running-the-app)
8. [Running with Docker (optional)](#running-with-docker-optional)
9. [Demo credentials](#demo-credentials)
10. [Testing](#testing)
11. [API reference](#api-reference)
12. [Screenshots](#screenshots)
13. [Notes: assumptions, limitations and future improvements](#notes)

---

## Features

**Accounts**
- Register with full name, email, password and password confirmation (live strength checklist).
- Log in with an optional "keep me signed in" setting, log out, and view a profile page.
- Passwords are hashed with bcrypt. Sessions use a JWT in an **HttpOnly, SameSite=Strict cookie**, so JavaScript never touches the token.
- Expired or invalid sessions return the user to the login page with a clear message.

**Readings**
- Add, view, edit and delete readings (date, time slot, value in mg/dL).
- Four time slots: Morning (fasting), After breakfast, After lunch, After dinner.
- Reading history with date-range and time-slot filters, pagination, and confirm-before-delete.
- Every validation rule is enforced on **both** the frontend and the backend:

| Rule | Message |
|---|---|
| Value is required | `Please enter a glucose value.` |
| Whole number between 40 and 600 | `Value must be between 40 and 600 mg/dl.` |
| One reading per slot per day | `You already have an After lunch reading for this date.` |
| At most four readings per day | `You can add only 4 readings per day.` |
| Date cannot be in the future | `Date cannot be in the future.` |

**Reports**
- **Daily**: the selected date, with each reading and its slot.
- **Month-to-date**: the 1st of the selected month through the selected date.
- **Previous month**: the whole calendar month before the reference date.
- Each report shows highest, lowest, average (one decimal) and the number of readings, or a friendly empty state.
- Charts of readings over the month (several views, see Dashboard) plus a table view of the same data.

**Dashboard**
- Greeting, week strip for jumping between days, a dashed progress ring (readings logged out of four) with a day streak, one card per time slot with quick add/edit, Highest / Lowest / Average cards, a smooth-curve chart through the day, and a monthly section.
- The monthly chart has seven views: **Calendar** (heatmap with a details panel), **Daily range**, **Bubbles**, **Radial**, **Distribution**, **By slot** and **Daily average**.

**Reading history**
- Table or day-by-day timeline layout (remembered per browser), time-slot filter pills, date range filters, pagination and confirm-before-delete.

**Food plan**
- Meal ideas that follow the time of day (for example, dinner ideas from 5 PM and light options late at night). Other meals are behind a "Browse other meals" button. Also a plate-method guide and daily habits.
- These are general healthy-eating ideas, not a personal diet plan or medical advice.

**Doctor appointments**
- Add, edit and delete appointments, saved to your account so they follow you across devices. A countdown card shows the next one on the dashboard, and a "Take this to your visit" card copies a summary of this month's readings.
- Appointments previously saved in a browser by an earlier version are moved into the account automatically.

**Reminders**
- A dismissible card reminds you to log the latest due reading slot (Morning 7:00, After breakfast 10:00, After lunch 14:30, After dinner 21:00) and of appointments today or tomorrow.
- Optional browser notifications, which only fire while Sweety is open in a tab (there is no push or email service).

**Look and feel**
- Orange theme with dark mode (remembers your choice, follows the system setting at first), an animated mascot, pastel cards, and a mobile bottom navigation bar. Motion respects the "reduce motion" setting.

**Sample data**
- `POST /api/demo/sample-data` (the Profile page button) fills an account that has no readings with about four weeks of example readings and two appointments. It refuses if the account already has readings.

**Bonus items implemented**: pagination on `GET /api/readings`, monthly line chart, Docker Compose, React Testing Library tests, and a GitHub Actions CI workflow.

---

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 7, React Router 7, Axios, Tailwind CSS 4, Recharts, React Hook Form, Zod, Lucide React |
| Backend | Node.js 22, Express 5, JWT (`jsonwebtoken`), bcrypt, Zod, Helmet, CORS, `express-rate-limit`, cookie-parser |
| Database | PostgreSQL 16, Prisma ORM 6 |
| Testing | Jest + Supertest (backend, real test database), Vitest + React Testing Library (frontend) |
| Tooling | npm, Git, GitHub Actions, Docker Compose |

---

## Architecture

```
 Browser (React SPA)
   │  Axios, withCredentials, X-Requested-With header
   ▼
 Vite dev proxy / nginx  ──  /api/*  ──►  Express API
                                            │
             routes → validation (Zod) → auth middleware → controllers → services
                                            │
                                            ▼
                                     Prisma Client ──► PostgreSQL
```

**Backend layers**
- `routes/` map URLs to handlers and attach middleware.
- `middleware/` holds authentication (`requireAuth`), request validation (`validate(schema)`), the CSRF header check and the centralized error handler.
- `controllers/` translate HTTP to service calls and shape responses.
- `services/` contain the business rules (ownership, daily rules, report maths) and all database access.
- `validations/` define the Zod schemas for every request body and query.

**Response format** (all endpoints):

```jsonc
// success
{ "success": true, "message": "Reading saved.", "data": { ... }, "meta": { ... } }
// error
{ "success": false, "error": { "code": "DUPLICATE_TIME_SLOT", "message": "You already have an After lunch reading for this date.", "details": [{ "field": "timeSlot", "message": "..." }] } }
```

**Database design**

| Table | Columns |
|---|---|
| `users` | `id` UUID PK, `name`, `email` (unique), `password` (bcrypt hash), `created_at`, `updated_at` |
| `readings` | `id` UUID PK, `user_id` FK → users (ON DELETE CASCADE), `reading_date` DATE, `time_slot` enum, `glucose_value` INT, `created_at`, `updated_at` |
| `appointments` | `id` UUID PK, `user_id` FK → users (ON DELETE CASCADE), `doctor`, `specialty`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `location`, `notes`, `created_at`, `updated_at` |

- `TimeSlot` enum: `MORNING`, `AFTER_BREAKFAST`, `AFTER_LUNCH`, `AFTER_DINNER`.
- Unique constraint on `(user_id, reading_date, time_slot)`.
- Indexes on `(user_id, reading_date)` and `reading_date` for report queries, and on `(user_id, date)` for appointments.
- `CHECK (glucose_value BETWEEN 40 AND 600)` as a database-level safety net.
- Deleting a user deletes their readings and appointments.

**How the 4-per-day rule stays reliable**: creating or updating a reading runs inside a database transaction that first takes a PostgreSQL advisory lock for that user and date (`pg_advisory_xact_lock`). Concurrent requests for the same day are processed one at a time, so the daily count and duplicate-slot checks are always accurate. The unique index is a final guard, and the backend tests fire concurrent requests to prove it.

**Security**
- bcrypt (cost 12); password hashes are never selected into API responses.
- JWT in an HttpOnly, SameSite=Strict cookie; `Secure` in production. A `Bearer` header is also accepted for API clients like Postman.
- CSRF defence in depth: state-changing requests must include `X-Requested-With: XMLHttpRequest`, which other sites cannot add to cross-site requests, and CORS only allows `CLIENT_URL`.
- The user id always comes from the verified token. A `userId` in a request body is ignored, and another user's reading returns 404.
- Helmet headers, a 10 kB JSON body limit, rate limiting on `/api/auth/login` and `/api/auth/register` (20 requests per 15 minutes per IP).
- Prisma parameterizes every query; the one raw query (the advisory lock) uses a tagged template, which is parameterized too.
- Errors never expose stack traces, SQL or connection details; request logs include no bodies, cookies or tokens.

---

## Folder structure

```
sweety-blood-glucose-tracker/
├── backend/
│   ├── prisma/
│   │   ├── migrations/            # SQL migrations (incl. CHECK constraint)
│   │   ├── schema.prisma
│   │   └── seed.js                # demo user + sample readings and appointments
│   ├── src/
│   │   ├── config/                # env loading, Prisma client
│   │   ├── controllers/           # auth, reading, report, appointment, demo
│   │   ├── middleware/            # auth, validation, csrf, error
│   │   ├── routes/                # /api/auth, /api/readings, /api/reports, /api/appointments, /api/demo
│   │   ├── services/              # business logic + database access
│   │   ├── utils/                 # dates, time slots, messages, AppError
│   │   ├── validations/           # Zod schemas
│   │   ├── app.js                 # Express app (no listen, used by tests)
│   │   └── server.js              # starts the server
│   ├── tests/                     # Jest + Supertest
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Button, FormField, StatCard, states, dialogs…
│   │   │   ├── layout/            # Navbar, AppLayout, AuthLayout, route guards
│   │   │   ├── dashboard/         # SlotCards, DashedRing, MetricTile, WeekStrip, DailySlotChart…
│   │   │   ├── readings/          # ReadingForm, ReadingsTable, ReadingsTimeline, filters, pagination
│   │   │   ├── reports/           # GlucoseTrendChart and its views (calendar, bubbles, radial…), tabs, tables
│   │   │   ├── food/              # MealCard, TimedMealCard, PlateGuide
│   │   │   ├── appointments/      # AppointmentForm, AppointmentRow, NextAppointment
│   │   │   └── reminders/         # RemindersCard
│   │   ├── context/               # AuthContext, ToastContext
│   │   ├── hooks/                 # useAsync, useNow, useCountUp, useDocumentTitle…
│   │   ├── pages/                 # Login, Register, Dashboard, Readings, ReadingFormPage, Reports, FoodPlan, Appointments, Profile, NotFound
│   │   ├── services/              # api.js, authService, readingService, reportService, appointmentService
│   │   ├── test/                  # React Testing Library tests
│   │   ├── utils/  validations/
│   │   ├── App.jsx  main.jsx  index.css
│   ├── nginx.conf  Dockerfile  vite.config.js
├── docs/screenshots/
├── docker-compose.yml
├── render.yaml                    # Render Blueprint (database + API + frontend)
├── .env.example
└── README.md
```

---

## Prerequisites

- **Node.js 20.6+** (developed and tested on Node 22; the test script uses `node --env-file`) and npm
- **PostgreSQL 14+** (developed and tested on PostgreSQL 16)
- Git

---

## Installation and setup

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/sweety-blood-glucose-tracker.git
cd sweety-blood-glucose-tracker

cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 2. Create the PostgreSQL databases

Create a user and two databases: one for development and a separate one for the automated tests.

```bash
# Linux/macOS (adjust for your setup; on Windows use psql or pgAdmin)
sudo -u postgres psql -c "CREATE USER sweety WITH PASSWORD 'choose-a-password' CREATEDB;"
sudo -u postgres createdb -O sweety sweety_dev
sudo -u postgres createdb -O sweety sweety_test
```

### 3. Configure environment variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env`:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://sweety:choose-a-password@localhost:5432/sweety_dev?schema=public` |
| `JWT_SECRET` | Long random secret for signing tokens | output of `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime | `1d` |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Frontend origin allowed by CORS | `http://localhost:5173` |
| `NODE_ENV` | `development`, `test` or `production` | `development` |
| `APP_TIMEZONE` | Time zone that defines "today" | `Asia/Kolkata` |
| `COOKIE_SECURE` | Optional override for the cookie `Secure` flag | empty |

For the tests, create `backend/.env.test` with the same keys but pointing to the test database:

```bash
cp backend/.env backend/.env.test
# then edit backend/.env.test:
#   DATABASE_URL="postgresql://sweety:choose-a-password@localhost:5432/sweety_test?schema=public"
#   NODE_ENV="test"
```

The test runner refuses to start unless `NODE_ENV=test` and the database name contains `test`, so it can never wipe your development data.

The frontend needs no `.env` for local development (it calls `/api`, which Vite proxies to `http://localhost:5000`). To point it somewhere else, create `frontend/.env` with `VITE_API_URL`.

### 4. Run the Prisma migrations

```bash
cd backend
npx prisma migrate deploy     # applies prisma/migrations to DATABASE_URL
npx prisma generate           # (also runs automatically on npm install)
```

During development, after changing `schema.prisma`, use `npm run prisma:migrate` (`prisma migrate dev`).

### 5. Seed demo data

```bash
cd backend
npm run seed
```

This creates the demo user, sample readings covering the previous two months and the current month up to today, and two sample appointments. Re-running the seed resets the demo user's readings and appointments.

---

## Running the app

In two terminals:

```bash
# Terminal 1 – API on http://localhost:5000
cd backend
npm run dev        # or: npm start

# Terminal 2 – React app on http://localhost:5173
cd frontend
npm run dev
```

Open **http://localhost:5173** and log in with the demo account.

Health check: `GET http://localhost:5000/api/health`.

Production build of the frontend: `cd frontend && npm run build` (output in `frontend/dist`).

---

## Running with Docker (optional)

```bash
docker compose up --build              # PostgreSQL, API (runs migrations) and web app
docker compose exec api npm run seed   # optional demo data
```

- App: http://localhost:8080 (nginx serves the build and proxies `/api`)
- API: http://localhost:5000/api

Set `JWT_SECRET` in your shell or a root `.env` before using this beyond local testing.

---

## Demo credentials

| Email | Password |
|---|---|
| `demo@sweety.app` | `Demo@1234` |

The sample readings are illustrative values for demonstration only.

---

## Testing

```bash
# Backend: Jest + Supertest against the isolated PostgreSQL test database
cd backend
npm test                 # applies migrations to the test DB, then runs all suites
npm run test:coverage

# Frontend: Vitest + React Testing Library (API calls are mocked)
cd frontend
npm test
```

Each backend test starts from an empty database (tables are truncated before every test).

**Backend coverage (74 tests)**: successful registration, hashed password storage, duplicate email, password rules, login success, incorrect password, unknown email, remember-me cookie, logout, missing/expired/forged tokens, CSRF header, unauthorized reading access (no token and another user's reading), `userId` injection ignored, reading creation, missing glucose value, below 40, above 600, decimals, non-numeric, boundary values 40 and 600, duplicate slot, maximum four per day, concurrent duplicate requests, future date, invalid date, list filters and pagination, reading update (including not counting itself and moving between dates), deletion, cascade delete, daily / month-to-date / previous-month calculations, 1-decimal rounding, year boundary, leap-year February, empty report state and per-user isolation, plus appointment create / list order / update / delete, field validation, per-user isolation and cascade delete, and the sample-data endpoint (empty account only, never in the future, cannot run twice).

**Frontend coverage (43 tests)**: login form (validation, show/hide password, success, server error), registration form (required fields, password strength and match, duplicate email from the server, success), reading form (unit label, slots, required value and slot, out-of-range and decimal values, future date, successful submission, duplicate-slot / daily-limit / network errors), reading history (empty state, error state with retry, confirm before delete), day streak, appointment helpers (time formatting, "in N days", upcoming/past split, validation), the meal-by-time rules, and reminders.

GitHub Actions (`.github/workflows/ci.yml`) runs both suites on every push and pull request, with a PostgreSQL service container for the backend.

---

## API reference

Base URL: `http://localhost:5000/api`. All private endpoints need the auth cookie (set by login/register) or `Authorization: Bearer <token>`. `POST`, `PUT` and `DELETE` requests must send `X-Requested-With: XMLHttpRequest`.

### Auth

| Method | Endpoint | Body | Success | Errors |
|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password, confirmPassword }` | `201` `{ user }` + cookie | `400` validation, `409` email taken |
| POST | `/auth/login` | `{ email, password, rememberMe? }` | `200` `{ user }` + cookie | `400`, `401` invalid credentials, `429` too many attempts |
| POST | `/auth/logout` | – | `200`, cookie cleared | – |
| GET | `/auth/me` | – | `200` `{ user: { id, name, email, createdAt, updatedAt, totalReadings } }` | `401` |

### Readings

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/readings` | Body `{ readingDate: "YYYY-MM-DD", timeSlot, glucoseValue }`. `201`; `400` validation / future date; `409` duplicate slot or daily limit |
| GET | `/readings` | Query: `startDate`, `endDate`, `timeSlot`, `page` (default 1), `limit` (default 20, max 100). Returns `{ readings }` and `meta: { page, limit, total, totalPages }`. Sorted newest date first, then by slot |
| GET | `/readings/:id` | `200` or `404` (also for another user's reading) |
| PUT | `/readings/:id` | Same body and rules as POST; the reading being edited is not counted against itself |
| DELETE | `/readings/:id` | `200` or `404` |

Example:

```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" -H "X-Requested-With: XMLHttpRequest" \
  -H "Authorization: Bearer <token>" \
  -d '{"readingDate":"2026-10-15","timeSlot":"AFTER_LUNCH","glucoseValue":145}'
```

### Appointments

All routes need a logged-in user and only ever touch that user's appointments.

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/appointments` | `{ appointments }` sorted by date then time |
| POST | `/appointments` | Body `{ doctor, date: "YYYY-MM-DD", time: "HH:MM", specialty?, location?, notes? }`. `201`; `400` validation; `409` at the 200-appointment limit |
| PUT | `/appointments/:id` | Same body as POST. `404` for someone else's appointment or a malformed id |
| DELETE | `/appointments/:id` | `200` or `404` |

Date and time are stored as the user's local wall-clock strings, so they read the same on every device.

### Sample data

| Method | Endpoint | Notes |
|---|---|---|
| POST | `/demo/sample-data` | `201` `{ readings, appointments }`; `409 SAMPLE_DATA_EXISTS` if the account already has readings |

### Reports

`date` is optional and defaults to today (in `APP_TIMEZONE`). It cannot be in the future.

| Method | Endpoint | Range |
|---|---|---|
| GET | `/reports/daily?date=YYYY-MM-DD` | the selected date |
| GET | `/reports/month-to-date?date=YYYY-MM-DD` | 1st of the month → selected date |
| GET | `/reports/monthly?date=YYYY-MM-DD` | whole previous calendar month |

Response:

```json
{
  "success": true,
  "data": {
    "report": {
      "type": "month-to-date",
      "range": { "startDate": "2026-10-01", "endDate": "2026-10-15" },
      "isEmpty": false,
      "stats": { "highest": 200, "lowest": 85, "average": 128.3, "count": 6 },
      "readings": [{ "id": "…", "readingDate": "2026-10-01", "timeSlot": "MORNING", "glucoseValue": 100, "createdAt": "…", "updatedAt": "…" }]
    }
  }
}
```

When there are no readings, `isEmpty` is `true`, `stats` is `null` and `readings` is `[]`.

### Common error codes

`VALIDATION_ERROR` (400), `UNAUTHORIZED` / `TOKEN_EXPIRED` / `INVALID_TOKEN` / `INVALID_CREDENTIALS` (401), `CSRF_REJECTED` (403), `READING_NOT_FOUND` / `APPOINTMENT_NOT_FOUND` / `NOT_FOUND` (404), `EMAIL_TAKEN` / `DUPLICATE_TIME_SLOT` / `DAILY_LIMIT_REACHED` / `APPOINTMENT_LIMIT_REACHED` / `SAMPLE_DATA_EXISTS` (409), `TOO_MANY_REQUESTS` (429), `INTERNAL_SERVER_ERROR` (500), `DATABASE_UNAVAILABLE` (503).

---

## Deploying (Render)

`render.yaml` is a Render Blueprint that creates a PostgreSQL database, the API (Docker) and the static frontend.

1. In Render choose **New → Blueprint** and select this repository. Apply the blueprint.
2. Wait for `sweety-api` and `sweety-web` to go live. The API applies database migrations on start.
3. Render usually adds a suffix to the hostnames (for example `sweety-web-3nao.onrender.com`). Put the real frontend URL in `CLIENT_URL` on the API service, and the real API URL in the `/api/*` rewrite destination on the frontend, in `render.yaml`, then push.
4. Open the frontend URL and register an account.

Notes:
- The frontend proxies `/api` so the auth cookie stays first-party.
- New database migrations are applied automatically each time the API starts.
- On Render's free plan the API sleeps when idle (the first request is slow) and **the free PostgreSQL database expires 30 days after it is created**. To keep running for free, move `DATABASE_URL` to a non-expiring free Postgres such as Neon or Supabase.

## Screenshots

> These screenshots were taken before the redesign (orange theme, mascot, new dashboard and readings layout), so the live app looks different.

| | |
|---|---|
| Login ![Login](docs/screenshots/01-login.png) | Registration validation ![Register](docs/screenshots/00-register-validation.png) |
| Dashboard ![Dashboard](docs/screenshots/02-dashboard.png) | Reading history ![Readings](docs/screenshots/03-readings.png) |
| Add reading with API validation error ![Add reading](docs/screenshots/07-add-reading-errors.png) | Daily report ![Daily report](docs/screenshots/04-report-daily.png) |
| Month-to-date report ![Month-to-date](docs/screenshots/05-report-mtd.png) | Previous month report ![Previous month](docs/screenshots/06-report-previous-month.png) |
| Profile ![Profile](docs/screenshots/08-profile.png) | Mobile dashboard ![Mobile](docs/screenshots/09-mobile-dashboard.png) |

---

## Notes

### Assumptions

- **"Today"** for the future-date rule and default report dates is the calendar date in `APP_TIMEZONE` (default `Asia/Kolkata`). The frontend uses the browser's local date for its own check; the backend check is authoritative.
- **Rule order**: when a day already has four readings, any further reading gets "You can add only 4 readings per day." before the duplicate-slot message. With four slots, a fifth reading always also collides with a slot, so this order is the only way the daily-limit message is ever shown.
- **Glucose input**: whole numbers only. Numeric strings such as `"120"` are accepted by the API (HTML inputs send strings); `"120.5"`, `"12a"`, `null` and `""` are rejected with the messages above.
- **Previous-month report** takes an optional reference date (default today) and always covers the full calendar month before it, e.g. any date in October 2026 → 1–30 September 2026.
- **Report dates** cannot be in the future, the same as reading dates.
- **Average** is rounded half-up to one decimal using integer arithmetic (e.g. 130.25 → 130.3).
- **Authentication**: registration logs the user in immediately. Without "keep me signed in" the cookie lasts for the browser session; with it, the cookie lasts until the JWT expires (`JWT_EXPIRES_IN`).
- **Another user's reading** returns 404 rather than 403, so the API does not reveal that the id exists.
- **Deleting a user** cascades to their readings and appointments. There is no delete-account endpoint because it was not required.

### Known limitations

- There is no refresh-token flow: when the JWT expires the user logs in again.
- Logout clears the cookie but does not revoke the token server-side (stateless JWT). A token copied out of the browser stays valid until it expires.
- The rate limiter uses in-memory storage, so limits reset on restart and are not shared across multiple API instances.
- The frontend bundle is a single chunk (~900 kB before gzip, mostly Recharts); route-level code splitting would shrink the first load.
- No password reset or email verification.
- Reminders and browser notifications only work while Sweety is open in a tab, and the reminder times are fixed.
- The food plan is a fixed list of general ideas and is not personalised.

### What I would improve with more time

- Refresh tokens with rotation and a server-side revocation list.
- Redis caching of report results, invalidated when a reading changes.
- Reminders that arrive when the app is closed: web push or email, which needs a notification service.
- A doctor role with read-only access to assigned patients' reports.
- CSV/PDF export of reports and configurable units (mg/dL ↔ mmol/L).
- Playwright end-to-end tests in CI and route-level code splitting.
