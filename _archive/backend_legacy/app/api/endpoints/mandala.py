
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging
import random
import time
from app.core.mandala import render_mandala_card

router = APIRouter()
logger = logging.getLogger(__name__)

# ... existing base models ...

class Vector3(BaseModel):
    x: float
    y: float
    z: float

class NatalBlueprint(BaseModel):
    sunSign: str
    moonSign: str
    risingSign: str

class TransitData(BaseModel):
    activePlanets: List[str]

class CubeNode(BaseModel):
    id: str
    label: str
    color: Optional[str] = None

class CubeState(BaseModel):
    nearestNode: CubeNode

class EmotionState(BaseModel):
    vector: Vector3
    intensity: float

class MandalaGenerationInput(BaseModel):
    natalData: NatalBlueprint
    currentTransits: TransitData
    cubeState: CubeState
    emotionState: EmotionState

class MandalaResponse(BaseModel):
    prompt: str
    imageUrl: str
    timestamp: str

# ... existing build_mandala_prompt ...
# symmetryProfile (Hardcoded defaults for now as in TS)
def build_mandala_prompt(input: MandalaGenerationInput) -> str:
    natal = input.natalData
    transits = input.currentTransits
    cube = input.cubeState
    emotion = input.emotionState

    radial_segments = 12
    dominant_axes = 4
    style = "DEFRAG_OS"

    structure = (
        f"Subject: A perfectly symmetric radial mandala. "
        f"Structure: {radial_segments}-fold radial symmetry representing the Zodiac. "
        f"style: {style}, technical drawing, architectural blueprint aesthetic. "
        f"Background: Infinite black continuum."
    )

    center_layer = (
        f"Center Core: A precise geometric glyph synthesizing {natal.sunSign} Sun (radiant), "
        f"{natal.moonSign} Moon (reflective), and {natal.risingSign} Ascendant (directional). "
        f"No text, no faces, pure abstract geometry."
    )

    natal_layer = (
        f"Middle Ring: A static, crystalline lattice representing the Natal Chart. "
        f"{dominant_axes} dominant axes anchoring the structure. Heavy, permanent lines."
    )

    active_aspects = " and ".join(transits.activePlanets[:3])
    if transits.activePlanets:
        transit_layer = (
            f"Outer Ring: Dynamic, glowing nodes representing active transits ({active_aspects}). "
            f"Connected to the center by thin, luminous data streams. High contrast against the black void."
        )
    else:
        transit_layer = "Outer Ring: A calm, unbroken void ring representing a lack of turbulence."

    intensity = emotion.intensity
    base_palette = "Monochrome, Grayscale, Silver on Black"
    accent_color = cube.nearestNode.color if cube.nearestNode.color and intensity > 0.6 else "Pale Blue"
    tension = "jagged interference patterns, high visual tension" if intensity > 0.5 else "smooth gradients, harmonious balance"

    aesthetic = (
        f"Aesthetic: DEFRAG OS style. Minimal, precise, vector lines. 8k resolution. "
        f"Lighting: Volumetric rim lighting. Color Palette: {base_palette} with sparse {accent_color} accents for active nodes. "
        f"Texture: {tension}."
    )

    concept = f"Concept: The archetype of \"{cube.nearestNode.label}\" manifested as geometry."

    full_prompt = f"{structure} {center_layer} {natal_layer} {transit_layer} {aesthetic} {concept}"
    full_prompt += " --no text, --no letters, --no faces, --no organic curves, --no blur, --no watermark."

    return " ".join(full_prompt.split())

@router.post("/generate", response_model=MandalaResponse)
async def generate_mandala(input: MandalaGenerationInput):
    try:
        prompt = build_mandala_prompt(input)
        logger.info(f"Generated Mandala Prompt: {prompt}")
        return MandalaResponse(
            prompt=prompt,
            imageUrl="https://replicate.delivery/pbxt/MockMandalaImageUUID/mandala.png",
            timestamp=datetime.utcnow().isoformat()
        )
    except Exception as e:
        logger.error(f"Mandala generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- NEW: Matplotlib Card Endpoint ---

class MandalaCardInput(BaseModel):
    user_id: str
    dt: datetime
    lat: float
    lon: float

@router.post("/card", responses={200: {"content": {"image/png": {}}}})
async def get_mandala_card(input: MandalaCardInput):
    """
    Generates a deterministic Mandala Card using Matplotlib directly.
    Returns binary PNG.
    """
    try:
        logger.info(f"Rendering Mandala Card for {input.user_id}")

        # Call the core rendering logic
        image_bytes = render_mandala_card({
            "dt": input.dt,
            "lat": input.lat,
            "lon": input.lon,
            # In future: pass retrieved natal chart here if necessary for speed
        })

        return Response(content=image_bytes, media_type="image/png")

    except Exception as e:
        logger.error(f"Card rendering failed: {e}")
        # Return 500 but log error
        raise HTTPException(status_code=500, detail=str(e))
