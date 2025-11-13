from fastapi import FastAPI
from app.apis.v1.configuration import router

app = FastAPI(title="Notification Service", version="0.1.0")

app.include_router(router, prefix="/api/v1", tags=["notifications"])

@app.get("/health")
async def health():
    return {"status": "healthy"}

