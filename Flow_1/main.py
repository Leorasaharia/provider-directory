# main.py
from dotenv import load_dotenv
load_dotenv()

from typing import List
import io
import zipfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import ProviderInput, ProviderReport
from orchestrator import Flow1Orchestrator
from agents.document_extraction_agent import DocumentExtractionAgent

app = FastAPI(title="Provider Data Validation – Flow 1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for dev; tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Flow1Orchestrator()
doc_extractor = DocumentExtractionAgent()


@app.get("/health")
def health_check():
    return {"status": "ok", "flow": "flow-1"}


@app.post("/flow1/validate-provider", response_model=ProviderReport)
def validate_single_provider(provider: ProviderInput):
    """
    Run Flow-1 for a single provider (structured JSON input).
    """
    return orchestrator.run_for_provider(provider)


@app.post("/flow1/validate-batch")
def validate_batch(providers: List[ProviderInput]):
    """
    Run Flow-1 for a batch of providers (structured input from CSV/etc.).

    Uses a thread pool under the hood to validate multiple providers
    in parallel, significantly improving speed for larger batches.
    """
    max_workers = 8  # tweak this if needed

    reports = orchestrator.run_batch(providers, max_workers=max_workers)
    review_queue = orchestrator.build_review_queue(reports)

    return {
        "reports": [r.model_dump() for r in reports],
        "review_queue": [r.model_dump() for r in review_queue],
    }


@app.post("/flow1/ingest-pdf")
async def ingest_pdf(file: UploadFile = File(...)):
    """
    Accepts:
    - A single PDF
    - OR a ZIP file containing one or more PDFs

    Extracts providers using Gemini (DocumentExtractionAgent),
    then runs the standard Flow-1 validation pipeline.
    """
    filename = (file.filename or "").lower()
    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    extracted_providers: List[ProviderInput] = []

    # -------- CASE 1: ZIP FILE (contains PDFs) --------
    if filename.endswith(".zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                pdf_files = [
                    name for name in z.namelist()
                    if name.lower().endswith(".pdf")
                ]

                if not pdf_files:
                    raise HTTPException(
                        status_code=400,
                        detail="ZIP file does not contain any PDF documents.",
                    )

                for pdf_name in pdf_files:
                    pdf_bytes = z.read(pdf_name)
                    providers = doc_extractor.extract_providers_from_pdf(pdf_bytes)
                    extracted_providers.extend(providers)

        except zipfile.BadZipFile:
            raise HTTPException(status_code=400, detail="Invalid ZIP file uploaded.")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing ZIP: {e}")

    # -------- CASE 2: SINGLE PDF --------
    elif filename.endswith(".pdf"):
        extracted_providers = doc_extractor.extract_providers_from_pdf(content)

    # -------- UNSUPPORTED FILE --------
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Upload a PDF or a ZIP containing PDFs.",
        )

    if not extracted_providers:
        raise HTTPException(
            status_code=422,
            detail="No providers could be extracted from the document(s).",
        )

    # -------- RUN FLOW-1 PIPELINE --------
    max_workers = 8
    reports = orchestrator.run_batch(extracted_providers, max_workers=max_workers)
    review_queue = orchestrator.build_review_queue(reports)

    return {
        "total_extracted_providers": len(extracted_providers),
        "reports": [r.model_dump() for r in reports],
        "review_queue": [r.model_dump() for r in review_queue],
    }
