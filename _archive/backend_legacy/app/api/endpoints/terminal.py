from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
import datetime
from app.core.pass_generator import PassGenerator
from app.core import knowledge_base
import firebase_admin
from firebase_admin import firestore
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class WalletSignRequest(BaseModel):
    userId: str

class RelationalGeometry(BaseModel):
    architecture: str
    tension_node: str
    resolution: str

class TimelineEvent(BaseModel):
    id: str
    time: str
    type: str  # 'SYNC' | 'SOMATIC' | 'RELATIONAL' | 'SYSTEM'
    shadowId: Optional[str] = None
    recurrenceScore: int
    importance: int
    labels: List[str]
    narrative: Optional[str] = None
    location: Optional[str] = None
    media_url: Optional[str] = None

class KnowledgeItem(BaseModel):
    title: str
    short_desc: str
    deep_dive: str

class LogEventRequest(BaseModel):
    userId: str
    type: str # 'SYNC', 'SOMATIC', 'RELATIONAL'
    narrative: str
    location: Optional[str] = None
    media_url: Optional[str] = None
    media_url: Optional[str] = None
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = {} # DefragAnalysis, User Profile, etc.

class ChatResponse(BaseModel):
    reply: str
    audio_url: Optional[str] = None


# Mock Data
MOCK_TOPOLOGY = {
    "architecture": "Defensive Triangulation",
    "tension_node": "Unspoken Expectations",
    "resolution": "Differentiation from Core"
}

MOCK_TIMELINE = [
    {
        "id": "evt_1",
        "time": datetime.datetime.now().isoformat(),
        "type": "SYNC",
        "recurrenceScore": 8,
        "importance": 9,
        "labels": ["Mirroring", "Gate 51"],
        "narrative": "Unexpected encounter mirroring internal state."
    },
    {
        "id": "evt_2",
        "time": (datetime.datetime.now() - datetime.timedelta(days=1)).isoformat(),
        "type": "SOMATIC",
        "recurrenceScore": 3,
        "importance": 5,
        "labels": ["Tension", "Solar Plexus"],
        "narrative": "Physical release of stored data."
    },
    {
        "id": "evt_3",
        "time": (datetime.datetime.now() - datetime.timedelta(days=3)).isoformat(),
        "type": "RELATIONAL",
        "recurrenceScore": 7,
        "importance": 8,
        "labels": ["Projection", "Shadow"],
        "narrative": "Conflict revealing hidden projection mechanism."
    }
]

@router.get("/topology/{user_id}", response_model=RelationalGeometry)
async def get_topology(user_id: str):
    # In future, fetch from Firestore based on user analysis history
    return MOCK_TOPOLOGY

@router.get("/timeline/{user_id}", response_model=List[TimelineEvent])
async def get_timeline(user_id: str):
    # In future, fetch from Firestore
    return MOCK_TIMELINE

@router.get("/knowledge/{topic_key}", response_model=Optional[KnowledgeItem])
async def get_knowledge(topic_key: str):
    data = knowledge_base.get_topic(topic_key)
    if not data:
        raise HTTPException(status_code=404, detail="Topic not found")
    return data

@router.post("/timeline/log")
async def log_event(request: LogEventRequest):
    try:
        db = firestore.client()
        # Ensure subcollection 'timeline' exists for user
        event_data = {
            "userId": request.userId,
            "type": request.type,
            "narrative": request.narrative,
            "location": request.location,
            "media_url": request.media_url,
            "timestamp": request.timestamp or datetime.datetime.utcnow().isoformat(),
            "created_at": datetime.firestore.SERVER_TIMESTAMP
        }

        db.collection('users').document(request.userId).collection('timeline').add(event_data)

        return {"status": "success", "event": event_data}
    except Exception as e:
        logger.error(f"Failed to log timeline event: {e}")
        # Mock success for offline dev
        return {"status": "success_mock", "event": request.dict()}

@router.post("/wallet/sign")
async def sign_wallet(request: WalletSignRequest):
    try:
        generator = PassGenerator()
        # In a real implementation, we would also sign the pass with SSL certificates here
        # For now, we return the bundle with the correct structure and artwork
        pass_buffer = generator.generate_pass_bundle(request.userId)

        return Response(
            content=pass_buffer.getvalue(),
            media_type="application/vnd.apple.pkpass",
            headers={"Content-Disposition": "attachment; filename=defrag_artifact.pkpass"}
        )
    except Exception as e:
        print(f"Wallet generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

        return Response(
            content=pass_buffer.getvalue(),
            media_type="application/vnd.apple.pkpass",
            headers={"Content-Disposition": "attachment; filename=defrag_artifact.pkpass"}
        )
    except Exception as e:
        print(f"Wallet generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat", response_model=ChatResponse)
async def chat_agent(request: ChatRequest):
    # Live Agent Interaction using Gemini 2.0 Flash
    import google.generativeai as genai
    import os

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return ChatResponse(reply="[OFFLINE MODE] I cannot access the cognitive field (No API Key).")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Construct Prompt with Knowledge Base Context
    # We can inject knowledge base summaries here if needed

    prompt = f"""
    You are the DEFRAG Live Agent, a sophisticated cognitive AI.

    CONTEXT:
    {request.context}

    USER QUERY:
    {request.message}

    DIRECTIVES:
    1. Answer concisely but with "Cyber-Noir" flair.
    2. Reference Bressloff-Cowan (geometry) or Jung (archetypes) if relevant.
    3. Be helpful but maintain the persona of an Operating System.
    """

    try:
        response = model.generate_content(prompt)
        return ChatResponse(reply=response.text)
    except Exception as e:
        logger.error(f"Chat generation failed: {e}")
        return ChatResponse(reply="[SYSTEM ERROR] Signal interrupted.")
