# main.py
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import ProviderInput, ProviderReport
from orchestrator import Flow1Orchestrator

app = FastAPI(title="Provider Data Validation – Flow 1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for dev; tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Flow1Orchestrator()


@app.get("/health")
def health_check():
    return {"status": "ok", "flow": "flow-1"}


@app.post("/flow1/validate-provider", response_model=ProviderReport)
def validate_single_provider(provider: ProviderInput):
    """
    Run Flow-1 for a single provider (mainly for testing).
    """
    return orchestrator.run_for_provider(provider)


@app.post("/flow1/validate-batch")
def validate_batch(providers: List[ProviderInput]):
    """
    Run Flow-1 for a batch of providers.

    Uses a thread pool under the hood to validate multiple providers
    in parallel, significantly improving speed for larger batches.
    """
    # You can tweak this number based on performance and rate-limit behavior.
    max_workers = 8

    reports = orchestrator.run_batch(providers, max_workers=max_workers)
    review_queue = orchestrator.build_review_queue(reports)
    return {
        "reports": [r.model_dump() for r in reports],
        "review_queue": [r.model_dump() for r in review_queue],
    }
