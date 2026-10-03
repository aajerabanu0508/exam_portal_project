# AWS Learning Assessment Platform - 

A secure, full-stack online examination platform for AWS and Computer Science assessments. Built with React + TypeScript (Vite), FastAPI (Python), and PostgreSQL.

---

## Features

- **Student Flow**: Login → Rules → Camera/Mic check → Fullscreen exam → Results
- **30 Original GATE-style CS Questions** across 10 topics
- **Proctoring**: Tab-switch detection, fullscreen monitoring, anti-copy controls
- **Auto-submit** after configurable violations
- **Real-time timer** with warnings at 5 min and 1 min
- **Question navigation panel** with color-coded status
- **Trainer Dashboard**: Stats, results table, CSV export
- **Question management**: Full CRUD with topic/difficulty filters
- **Test configuration**: Duration, passing %, negative marking, violation limits
- **JWT Authentication** (students: passwordless, trainers: email+password)

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+ running locally (or use Docker)

### 1. Clone and Configure

```bash
git clone <repo-url>
cd exam-platform
cp .env.example .env
# Edit .env as needed
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # macOS/Linux
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create backend/.env from .env.example)
export DATABASE_URL="postgresql://examuser:exampass@localhost:5432/examdb"
export SECRET_KEY="your-secret-key"

# Create database (make sure PostgreSQL is running)
createdb -U examuser examdb  # or use psql

# Run DB migrations and seed data
python -m app.services.seed

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: http://localhost:8000  
API docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (create frontend/.env)
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## Docker Setup (Recommended)

```bash
cp .env.example .env
docker-compose up --build -d

# Seed the database (first time only)
docker-compose exec backend python -m app.services.seed
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Default Credentials

| Role    | Email                    | Password  |
|---------|--------------------------|-----------|
| Trainer | admin@awslearning.com    | Admin@123 |

Students register without a password via the student portal.

---

## Project Structure

```
exam-platform/
├── frontend/               # React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/     # Reusable UI components (Modal, Loader)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── hooks/          # useTimer, useProctor, useMedia
│   │   ├── pages/          # LoginPage, RulesPage, ExamPage, ResultPage
│   │   │   └── admin/      # Admin dashboard pages
│   │   ├── services/       # Axios API client
│   │   └── types/          # TypeScript interfaces
│   └── tailwind.config.ts
│
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI routes (auth, tests, questions, attempts, results)
│   │   ├── core/           # Config, JWT security
│   │   ├── database/       # SQLAlchemy session
│   │   ├── models/         # ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Question bank data, seed script
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Student registration (passwordless) |
| POST | /api/auth/login | Trainer login |
| GET | /api/tests | List available tests |
| POST | /api/attempts/start/{test_id} | Start exam (returns shuffled questions) |
| POST | /api/attempts/{id}/answer | Save/update answer |
| POST | /api/attempts/{id}/violation | Report a proctoring violation |
| POST | /api/attempts/{id}/submit | Submit and get results |
| GET | /api/results | List all results (trainer only) |
| GET | /api/results/export/csv | Export CSV (trainer only) |
| GET | /api/results/stats/admin | Dashboard stats (trainer only) |

Full interactive docs: http://localhost:8000/docs

---

## Security Notes

This platform implements **browser-level proctoring controls** as deterrents, not absolute anti-cheating measures. A browser-based system cannot prevent:
- Use of another device
- Screen photography
- OS-level tools or browser extensions

These controls are appropriate for controlled environments (training centers, supervised labs). For high-stakes examinations, consider dedicated proctoring software.

**What this platform does protect**:
- Correct answers are never sent to the frontend before submission
- Server-side time validation on submission
- JWT auth with role-based access control
- Answer validation performed server-side only
- Duplicate submission prevention via attempt status tracking

---

## Question Bank

30 original GATE-style CS questions covering:

| Topic | Count |
|-------|-------|
| Data Structures | 4 |
| Algorithms | 4 |
| Operating Systems | 3 |
| Computer Networks | 4 |
| DBMS | 3 |
| Computer Organization | 3 |
| Digital Logic | 2 |
| Theory of Computation | 3 |
| Compiler Design | 2 |
| Discrete Mathematics | 2 |

Questions can be managed via the trainer dashboard or imported via the API.

---

## Extending the Platform

- **Add more questions**: Use the trainer dashboard or POST to `/api/questions/import`
- **Create new tests**: Configure duration, difficulty distribution, passing % via the Test Config page
- **AWS-specific questions**: Add questions with topic "AWS Cloud" via the question manager
- **Custom topics**: Any topic string is supported; update the TOPICS list in `QuestionsPage.tsx`
