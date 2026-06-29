# Predictive AI for Real Estate Investment Analysis (Pakistan)

Full-stack web application for Karachi & Islamabad property investment analysis using ML price predictions, risk scoring, and role-based dashboards.

## Project Structure

```
├── backend/          # FastAPI + SQLAlchemy + ML pipeline
├── frontend/         # React + Vite + Tailwind CSS
├── zameen-updated.csv  # Zameen.com dataset (168K rows)
├── .env.example      # Environment variable template
└── README.md
```

## Prerequisites

- Python 3.11+
- Node.js 18+
- Neon Postgres account (pooled connection string)

## 1. Environment Setup

Copy `.env.example` to `.env` in the **project root**:

```bash
cp .env.example .env
```

Edit `.env` with your real Neon **pooled** connection string:

```
DATABASE_URL=postgresql+psycopg2://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:5173
```

## 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### Test Neon Connection

```bash
python scripts/test_connection.py
```

### Run Database Migrations

```bash
python -m alembic upgrade head
```

> **Windows note:** If `alembic` or `uvicorn` is "not recognized", always prefix with `python -m` (see below).

### Train ML Model (separate from API server)

```bash
python -m app.ml.train
```

This trains Linear Regression, Random Forest, and XGBoost on Karachi/Islamabad data and saves the best model to `backend/ml/artifacts/`.

**Latest training results:**
| Model | R² | MAE | RMSE |
|-------|-----|-----|------|
| Linear Regression | 44.9% | 14.2M | 27.3M |
| **Random Forest** | **90.0%** | **3.4M** | **11.7M** |
| XGBoost | 89.7% | 3.8M | 11.8M |

### Seed Database (one-time)

```bash
python scripts/seed_db.py
```

Optional: set `SEED_LIMIT=1000` in `.env` to seed a subset for testing.

Demo accounts created:
- `admin@realestate.pk` / `admin123`
- `investor@realestate.pk` / `investor123`
- `agent@realestate.pk` / `agent123`

### Start API Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

## Dataset Inspection

Before preprocessing, inspect the CSV:

```bash
python backend/scripts/inspect_dataset.py
```

**Confirmed columns:** `property_id`, `location_id`, `page_url`, `property_type`, `price`, `location`, `city`, `province_name`, `latitude`, `longitude`, `baths`, `area`, `purpose`, `bedrooms`, `date_added`, `agency`, `agent`, `Area Type`, `Area Size`, `Area Category`

**Key findings:**
- 168,446 total rows; 97,910 in Karachi + Islamabad
- `price` is already numeric (`int64` PKR) — no Lakh/Crore text in this dataset
- 5 cities in dataset; filtered to Karachi (60,484) and Islamabad (37,426)

## API Endpoints

| Resource | Prefix | Description |
|----------|--------|-------------|
| Auth | `/auth` | Register, login, JWT |
| Users | `/users` | Admin user management |
| Properties | `/properties` | Search, CRUD, favorites |
| Predictions | `/predictions` | ML price + risk |
| Analytics | `/analytics` | System stats, model metrics |

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | User management, dataset upload, system analytics |
| **Investor** | Search properties, predictions, favorites, location charts |
| **Agent** | Add/edit own listings, view listing analytics |

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Alembic, JWT, bcrypt
- **Database:** Neon Postgres (SSL required, pooled connections) or local Postgres via Docker
- **ML:** scikit-learn, XGBoost, joblib
- **Frontend:** React 19, Vite, Tailwind CSS v4, Zustand, Recharts, Framer Motion

## Docker (easiest way to share with others)

If manual setup fails on another machine, use Docker — see **[DOCKER.md](DOCKER.md)** for full instructions.

```bash
# From project root (requires Docker Desktop + zameen-updated.csv)
docker compose up --build
```

Then open http://localhost:5173
