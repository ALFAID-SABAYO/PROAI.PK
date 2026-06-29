from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routers import analytics, auth, predictions, properties, stats, users

settings = get_settings()

app = FastAPI(
    title="Real Estate Investment AI — Pakistan",
    description="Predictive AI for Karachi & Islamabad property investment analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("uvicorn.error").exception("Unhandled error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/")
def root():
    return {
        "message": "PropAI.pk API is running",
        "docs": "/docs",
        "health": "/health",
        "frontend": "http://localhost:5173",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(properties.router)
app.include_router(predictions.router)
app.include_router(analytics.router)
app.include_router(stats.router)
