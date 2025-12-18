from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import logging
import firebase_admin
from firebase_admin import firestore

router = APIRouter()
logger = logging.getLogger(__name__)

class BioMetrics(BaseModel):
    birthDate: str
    birthTime: Optional[str] = None
    birthLocation: str
    humanDesignType: Optional[str] = None
    enneagram: Optional[str] = None

class Vector3(BaseModel):
    x: float
    y: float
    z: float

class LineageMember(BaseModel):
    id: str
    role: str
    lifePath: Optional[int] = None
    humanDesign: Optional[str] = None
    vector: Optional[Vector3] = None

class UserInitRequest(BaseModel):
    userId: str
    email: str
    name: str
    bioMetrics: BioMetrics
    familyMembers: Optional[list[LineageMember]] = []

@router.post("/init")
async def initialize_user(request: UserInitRequest):
    try:
        db = firestore.client()
        user_ref = db.collection('users').document(request.userId)

        user_data = {
            "id": request.userId,
            "email": request.email,
            "name": request.name,
            "bioMetrics": request.bioMetrics.dict(),
            "familyMembers": [m.dict() for m in request.familyMembers] if request.familyMembers else [],
            "tier": "ACCESS_SIGNAL", # Default tier
            "initializedAt": datetime.utcnow()
        }

        # Merge allowing partial updates if user exists
        user_ref.set(user_data, merge=True)

        return {"status": "success", "user": user_data}
    except Exception as e:
        logger.error(f"Error initializing user: {e}")
        # For dev/demo, if Firestore fails, return mock success provided the request was valid
        return {"status": "success_mock", "user": request.dict()}
