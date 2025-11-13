from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.services.ledger_service import LedgerService

router = APIRouter()


class HashRequest(BaseModel):
    data: Dict[str, Any]


class HashResponse(BaseModel):
    hash: str


class VerifyRequest(BaseModel):
    data: Dict[str, Any]
    hash: str


class VerifyResponse(BaseModel):
    verified: bool


class StoreSurveyRequest(BaseModel):
    survey_id: str
    survey_data: Dict[str, Any]


class StoreSurveyResponse(BaseModel):
    transaction_hash: Optional[str] = None
    hash: str


class StoreResponseRequest(BaseModel):
    response_id: str
    response_data: Dict[str, Any]


class StoreResponseResponse(BaseModel):
    transaction_hash: Optional[str] = None
    hash: str


@router.post("/hash/generate", response_model=HashResponse)
async def generate_hash(request: HashRequest):
    """Generate hash for data."""
    try:
        service = LedgerService()
        hash_value = service.hash_data(request.data)
        return HashResponse(hash=hash_value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hash/verify", response_model=VerifyResponse)
async def verify_hash(request: VerifyRequest):
    """Verify data integrity using hash."""
    try:
        service = LedgerService()
        verified = service.verify_hash(request.data, request.hash)
        return VerifyResponse(verified=verified)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/survey/store", response_model=StoreSurveyResponse)
async def store_survey_hash(request: StoreSurveyRequest):
    """Store survey hash on blockchain."""
    try:
        service = LedgerService()
        tx_hash = service.store_survey_hash(request.survey_id, request.survey_data)
        hash_value = service.hash_data(request.survey_data)
        return StoreSurveyResponse(transaction_hash=tx_hash, hash=hash_value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/response/store", response_model=StoreResponseResponse)
async def store_response_hash(request: StoreResponseRequest):
    """Store response hash on blockchain."""
    try:
        service = LedgerService()
        tx_hash = service.store_response_hash(request.response_id, request.response_data)
        hash_value = service.hash_data(request.response_data)
        return StoreResponseResponse(transaction_hash=tx_hash, hash=hash_value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/survey/verify")
async def verify_survey_integrity(survey_id: str, survey_data: Dict[str, Any], stored_hash: str):
    """Verify survey integrity."""
    try:
        service = LedgerService()
        verified = service.verify_survey_integrity(survey_id, survey_data, stored_hash)
        return {"verified": verified}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/response/verify")
async def verify_response_integrity(response_id: str, response_data: Dict[str, Any], stored_hash: str):
    """Verify response integrity."""
    try:
        service = LedgerService()
        verified = service.verify_response_integrity(response_id, response_data, stored_hash)
        return {"verified": verified}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audit/{identifier}")
async def get_audit_trail(identifier: str):
    """Get audit trail from blockchain."""
    try:
        service = LedgerService()
        trail = service.get_audit_trail(identifier)
        if trail:
            return trail
        else:
            raise HTTPException(status_code=404, detail="Audit trail not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

