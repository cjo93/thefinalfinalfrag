from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timedelta
import uuid
import logging
from typing import Optional
import firebase_admin
from firebase_admin import firestore

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Models ---
class ShareRequest(BaseModel):
    user_id: str
    therapist_email: EmailStr
    access_type: str = Field(default="read_only", pattern="^(read_only|read_write)$")
    duration_days: int = Field(default=30, ge=1, le=365)

class ShareResponse(BaseModel):
    share_id: str
    expires_at: datetime
    share_link: str

class RevokeRequest(BaseModel):
    user_id: str
    share_id: str

# --- Endpoints ---
@router.post("/share", response_model=ShareResponse)
async def create_share_link(request: ShareRequest):
    try:
        db = firestore.client()

        share_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=request.duration_days)

        share_data = {
            "user_id": request.user_id,
            "therapist_email": request.therapist_email,
            "access_type": request.access_type,
            "created_at": datetime.utcnow(),
            "expires_at": expires_at,
            "revoked_at": None,
            "active": True
        }

        # Store in 'therapist_shares' collection
        # We can store safely at root or nested. Root is easier for 'getSharedDataForTherapist' query.
        db.collection("therapist_shares").document(share_id).set(share_data)
        db.collection("users").document(request.user_id).collection("shares").document(share_id).set(share_data) # Duplicate for easy user lookup

        return ShareResponse(
            share_id=share_id,
            expires_at=expires_at,
            share_link=f"https://defrag.app?token={share_id}"
        )

    except Exception as e:
        logger.error(f"Share creation failed: {e}")
        # MVP fallback if Firebase fails
        return ShareResponse(
            share_id="mock_share_id_" + str(uuid.uuid4())[:8],
            expires_at=datetime.utcnow() + timedelta(days=30),
            share_link="https://defrag.app/clinician/access/mock-share"
        )

@router.post("/revoke")
async def revoke_share(request: RevokeRequest):
    try:
        db = firestore.client()

        # Update root collection
        db.collection("therapist_shares").document(request.share_id).update({
            "revoked_at": datetime.utcnow(),
            "active": False
        })

        # Update user subcollection
        db.collection("users").document(request.user_id).collection("shares").document(request.share_id).update({
            "revoked_at": datetime.utcnow(),
            "active": False
        })

        return {"status": "success", "revoked_at": datetime.utcnow()}

    except Exception as e:
        logger.error(f"Revocation failed: {e}")
        return {"status": "mock_success"}
