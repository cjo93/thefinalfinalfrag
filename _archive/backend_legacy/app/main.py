from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DEFRAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://defrag.app", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

import firebase_admin
from firebase_admin import credentials, firestore

try:
    # Initialize Firebase Admin
    # Use explicit credential path or default to GOOGLE_APPLICATION_CREDENTIALS
    # For local dev without env var, we might skip or warn
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    logger.info("Firebase Admin initialized successfully")
except Exception as e:
    logger.warning(f"Firebase Admin initialization failed: {e}")

from app.api.endpoints import analysis, therapist, users, mandala, payment, terminal
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(therapist.router, prefix="/api/therapist", tags=["therapist"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(mandala.router, prefix="/api/mandala", tags=["mandala"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(terminal.router, prefix="/api/terminal", tags=["terminal"])

# Register Contact Router
from app.api.endpoints import contact
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/")
async def root():
    return {"name": "DEFRAG API", "version": "1.0.0"}
