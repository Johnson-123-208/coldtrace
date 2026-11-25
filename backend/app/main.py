from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_connection
from app.routes import router
from app.seed import bootstrap


@asynccontextmanager
async def lifespan(_app: FastAPI):
    conn = get_connection()
    try:
        bootstrap(conn)
    finally:
        conn.close()
    yield


app = FastAPI(
    title="ColdTrace API",
    description="Cold-chain shipment temperature integrity — demo MVP by Inform8",
    version="0.1.0-mvp",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/")
def root():
    return {"service": "ColdTrace", "docs": "/docs", "health": "/api/health"}