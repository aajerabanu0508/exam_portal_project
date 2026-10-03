from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, tests, questions, attempts, results

app = FastAPI(
    title="AWS Learning Assessment API",
    description="Secure online examination platform for AWS and CS assessments",
    version="1.0.0",
)

cors_origins = list({
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:5173",
    "http://localhost:3000",
    "http://13.127.244.35:5173",
    "http://13.127.244.35:8000",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tests.router)
app.include_router(questions.router)
app.include_router(attempts.router)
app.include_router(results.router)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "AWS Learning Assessment API"}
