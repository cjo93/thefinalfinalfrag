from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

# Configuration (In a real app, these would be env vars)
ADMIN_EMAIL = "chadowen93@gmail.com"

def send_email_task(contact: ContactRequest):
    # This is a mock function. In production, integrate with SES, SendGrid, or SMTP.
    # We are logging it as requested, ensuring the destination email is not exposed in the frontend.
    logger.info(f"--- NEW CONTACT FORM SUBMISSION ---")
    logger.info(f"FROM: {contact.name} <{contact.email}>")
    logger.info(f"TO: {ADMIN_EMAIL}")
    logger.info(f"MESSAGE: {contact.message}")
    logger.info(f"-----------------------------------")

@router.post("/send")
async def send_contact_email(contact: ContactRequest, background_tasks: BackgroundTasks):
    try:
        # Offload "sending" to background task to keep response fast
        background_tasks.add_task(send_email_task, contact)
        return {"status": "success", "message": "Transmission received."}
    except Exception as e:
        logger.error(f"Contact form error: {e}")
        raise HTTPException(status_code=500, detail="Transmission failed.")
