
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class CheckoutRequest(BaseModel):
    tier: str
    userId: str
    successUrl: str
    cancelUrl: str

@router.post("/checkout")
async def create_checkout_session(data: CheckoutRequest):
    if not stripe.api_key:
        return {"error": "Stripe configuration missing", "url": None}

    try:
        # Map tier to Price ID
        # In a real app, these should be in a config or DB
        price_id = ""
        if data.tier == "HELIX_PROTOCOL":
            price_id = "price_HlxProt_Mock" # Replace with real ID
        elif data.tier == "ARCHITECT_NODE":
            price_id = "price_ArchNode_Mock"

        # For Demo/Dev, if price ID is mock, we can't really create a session easily without errors
        # unless we use test mode keys and real test price IDs.
        # Fallback to a mock success URL if we detect we are in a purely local/mock env
        if "Mock" in price_id:
            # Check if we have a special test key that allows mocks
            pass

        # Create Checkout Session
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    # Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': data.tier.replace('_', ' '),
                        },
                        'unit_amount': 2999 if data.tier == "ARCHITECT_NODE" else 999,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=data.successUrl + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url=data.cancelUrl,
            client_reference_id=data.userId,
            metadata={
                'tier': data.tier,
                'user_id': data.userId
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        print(f"Stripe Error: {str(e)}")
        # For DEV environment safety, if Stripe fails (e.g. invalid key), return a mock ID to allow flow testing
        # BUT only if explicitly allowed or in debug mode.
        return {"error": str(e)}

@router.get("/checkout-status/{session_id}")
async def get_checkout_status(session_id: str):
    if not stripe.api_key:
        return {"error": "Stripe configuration missing"}

    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return {
            "status": session.status,
            "payment_status": session.payment_status,
            "customer_email": session.customer_details.email if session.customer_details else None,
            "tier": session.metadata.get('tier')
        }
    except Exception as e:
        return {"error": str(e)}
