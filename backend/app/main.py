"""FastAPI entrypoint for the SIBI learning website."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, lessons, progress
from app.seed import seed_lessons


@asynccontextmanager
async def lifespan(_: FastAPI):
    print("[DATABASE_DEBUG] Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[DATABASE_DEBUG] Database tables created successfully.")
        
        db = SessionLocal()
        try:
            print("[DATABASE_DEBUG] Seeding lesson catalog...")
            seed_lessons(db)
            print("[DATABASE_DEBUG] Seeding complete.")
        finally:
            db.close()
    except Exception as e:
        import traceback
        print(f"[DATABASE_ERROR] Database setup failed: {str(e)}")
        print(f"[DATABASE_ERROR] Traceback: {traceback.format_exc()}")
        raise e
    yield



settings = get_settings()
app = FastAPI(
    title="SIBI Learning API",
    description="Backend for the SIBI sign-language learning website.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(lessons.router)
app.include_router(progress.router)


@app.get("/api/health", tags=["health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
