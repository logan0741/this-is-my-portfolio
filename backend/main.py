"""
포트폴리오 백엔드 서버 - FastAPI
Phase 2/3에서 사용
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
from routers import portfolio
from services.github_readme import update_all_readmes

PHASE = os.getenv("PHASE", "LOCAL")

# Create upload directories early for StaticFiles mounting
os.makedirs("uploads/images", exist_ok=True)
os.makedirs("uploads/certificates", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown events"""
    # Create tables
    Base.metadata.create_all(bind=engine)

    # Phase 2: Background README update on startup
    if PHASE == "LOCAL":
        import asyncio
        asyncio.create_task(update_all_readmes())

    # Phase 3: APScheduler setup
    if PHASE == "ORACLE":
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler()
        scheduler.add_job(update_all_readmes, "cron", hour=0, minute=0)
        scheduler.start()

    yield


app = FastAPI(
    title="Portfolio API",
    description="포트폴리오 백엔드 API (Phase 2/3)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://gun-hee.com",
        "https://www.gun-hee.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Routers
app.include_router(portfolio.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "phase": PHASE}
