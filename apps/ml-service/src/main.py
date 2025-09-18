from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from api import router
from config import settings
from utils.logging import setup_logging

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Student Community ML Service",
    description="Privacy-preserving ML service for stress analysis and content safety",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("ML_PORT", 8001)),
        reload=True if os.getenv("NODE_ENV") == "development" else False
    )