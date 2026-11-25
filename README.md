# ColdTrace

**Cold-chain shipment temperature integrity** — track lanes, ingest logger readings, and raise deterministic excursion alerts.

Demo MVP built by **Inform8**. Telemetry is **SIMULATED**; not for clinical or GxP use.

## Stack

| Layer | Tech |
|-------|------|
| Web | Vite + React + TypeScript + Tailwind (`web/`, port **5180**) |
| API | FastAPI + SQLite seed (`backend/`, port **8008**) |

## Features

- Shipment list with status: `ok` / `at-risk` / `breached`
- Detail view with temperature timeline and alert history
- `POST /api/shipments/{id}/readings` — ingest a reading; alerts when outside allowed band
- Deterministic excursion engine (no ML)

## Local run

### 1. API

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8008
```

Open [http://localhost:8008/docs](http://localhost:8008/docs)

### 2. Web

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:5180](http://localhost:5180)

Copy `.env.example` to `.env` at repo root (optional). Set `VITE_API_URL` in `web/.env` if the API is not on `localhost:8008`.

## Deploy

- **Vercel**: `vercel.json` builds `web/` (set `VITE_API_URL` to your Render API URL).
- **Render**: `render.yaml` deploys the FastAPI service; set `COLDTRACE_CORS_ORIGINS` to your Vercel origin.

## Environment keys

| Key | Default | Purpose |
|-----|---------|---------|
| `COLDTRACE_DATABASE_URL` | `sqlite:///./coldtrace.db` | SQLite file path |
| `COLDTRACE_CORS_ORIGINS` | `http://localhost:5180` | Comma-separated allowed origins |
| `COLDTRACE_HOST` | `0.0.0.0` | Bind host |
| `COLDTRACE_PORT` | `8008` | Local API port |
| `VITE_API_URL` | `http://localhost:8008` | Frontend API base URL |