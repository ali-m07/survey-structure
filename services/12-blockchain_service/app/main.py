from fastapi import FastAPI
from app.apis.v1.endpoints import router

app = FastAPI(title="Blockchain Service", version="0.1.0")

app.include_router(router, prefix="/api/v1", tags=["blockchain"])

@app.get("/health")
async def health():
    return {"status": "healthy"}

