"""
FastAPI application for the ActionNote backend.

This backend exposes endpoints for summarising meeting transcripts and extracting
action items.  It also includes placeholder endpoints for Stripe checkout
sessions and webhook handling.  Integrations with Supabase or other databases
should be added in a real deployment; here we focus on demonstrating core
functionality.

Run this server with:

```bash
uvicorn main:app --reload --port 8000
```

"""

from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import summarizer


class TranscriptInput(BaseModel):
    transcript: str
    summary_sentences: Optional[int] = 3


class SummaryResponse(BaseModel):
    summary: str
    tasks: List[str]


class CheckoutRequest(BaseModel):
    user_id: str
    plan: str  # e.g. "free", "pro", "team"


class CheckoutResponse(BaseModel):
    checkout_url: str


app = FastAPI(title="ActionNote Backend", version="0.1.0")

# Allow cross‑origin requests from frontend; in production restrict origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/summarize", response_model=SummaryResponse)
async def summarize_endpoint(payload: TranscriptInput):
    """
    Accepts a meeting transcript and returns a summary along with extracted
    action items.
    """
    text = payload.transcript.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    num_sentences = payload.summary_sentences or 3
    try:
        summary_text = summarizer.summarize(text, num_sentences=num_sentences)
        tasks = summarizer.extract_tasks(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return SummaryResponse(summary=summary_text, tasks=tasks)


@app.post("/create-checkout-session", response_model=CheckoutResponse)
async def create_checkout_session(req: CheckoutRequest):
    """
    Creates a checkout session for the specified plan.  In this demo we return a
    placeholder URL.  In a real implementation, you would use the `stripe`
    library with your secret key to create a session and return the session URL.

    Plans supported: free, pro ($9/mo), team ($29/mo).  Free plans do not
    require checkout.
    """
    plan = req.plan.lower()
    # In a real app, verify the plan and create a Stripe session
    if plan == "free":
        return CheckoutResponse(checkout_url="https://example.com/dashboard")
    # Provide dummy URLs to illustrate flow
    if plan == "pro":
        return CheckoutResponse(checkout_url="https://checkout.stripe.com/pay/pro-plan-session")
    if plan == "team":
        return CheckoutResponse(checkout_url="https://checkout.stripe.com/pay/team-plan-session")
    raise HTTPException(status_code=400, detail="Unsupported plan")


@app.post("/stripe-webhook")
async def stripe_webhook(payload: dict):
    """
    Placeholder endpoint for Stripe webhooks.  This handler simply acknowledges
    receipt of the event.  In production, validate the signature using your
    webhook secret and update user subscription status accordingly.
    """
    # Normally you would verify the signature header and parse the event
    # event = stripe.Event.construct_from(payload, stripe.api_key)
    # handle event types such as checkout.session.completed, invoice.paid, etc.
    return {"received": True}
