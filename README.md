# SIBI Learning

A small web app for learning **SIBI** (Sistem Isyarat Bahasa Indonesia —
Indonesia's standard sign language). You pick a lesson (alfabet, angka, or
sapaan), turn on your webcam, and the page tells you whether your hand sign
matches.

Everything runs locally; camera frames never leave your browser.

## What's inside

- **`frontend/`** — Vite + React + TypeScript app. Hand tracking via
  MediaPipe Hands, recognition via TensorFlow.js (CNN for static letters,
  LSTM for dynamic words).
- **`backend/`** — FastAPI + SQLite. Sign-up / login (JWT) and per-user
  lesson progress.
- **`ml/`** — Optional Python pipeline that trains your own CNN/LSTM from
  the [Kaggle SIBI Alphabets](https://www.kaggle.com/datasets/mlanangafkaar/datasets-lemlitbang-sibi-alphabets)
  dataset. The app also works without trained models — it falls back to a
  keypoint-similarity classifier so you can try the UX right away.

## Run it locally

You'll need Python 3.11+ and Node 18+.

```bash
# Backend — http://localhost:8000
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

```bash
# Frontend — http://localhost:5173 (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173, create an account, and pick a lesson.

## Deploying for free

Deploy `frontend/` to Vercel or Netlify, and `backend/` to Fly.io or Render.
Point the frontend at the backend by setting `VITE_API_URL`.

## License

MIT.
