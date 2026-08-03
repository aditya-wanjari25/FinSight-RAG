# api/routes/ingest.py

import os
import re
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from api.schemas import IngestRequest, IngestResponse, QuarterEnum
from ingestion.pipeline import ingest_document

router = APIRouter()

RAW_DIR = "data/raw"


@router.post("/ingest", response_model=IngestResponse)
async def ingest_pdf(request: IngestRequest):
    """
    Ingests a PDF document into the vector store.

    Runs the full pipeline:
    PDF → parse → chunk → embed → store in ChromaDB

    This is idempotent — running it twice on the same document
    will upsert (update) rather than duplicate chunks.

    Note: this is a long-running operation (30-60 seconds for a full 10-K).
    In production we'd run this as a background task via Celery or AWS SQS.
    For now it runs synchronously.
    """
    try:
        summary = ingest_document(
            pdf_path=request.pdf_path,
            ticker=request.ticker,
            year=request.year,
            quarter=request.quarter,
        )
        return IngestResponse(
            success=True,
            ticker=summary["ticker"],
            year=summary["year"],
            blocks_parsed=summary["blocks_parsed"],
            chunks_stored=summary["chunks_stored"],
            tokens_used=summary["tokens_used"],
            approximate_cost_usd=round(summary["tokens_used"] / 1_000_000 * 0.02, 4),
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


def _to_ingest_response(summary: dict) -> IngestResponse:
    """Shared by both ingest endpoints so the cost calc only lives in one place."""
    return IngestResponse(
        success=True,
        ticker=summary["ticker"],
        year=summary["year"],
        blocks_parsed=summary["blocks_parsed"],
        chunks_stored=summary["chunks_stored"],
        tokens_used=summary["tokens_used"],
        approximate_cost_usd=round(summary["tokens_used"] / 1_000_000 * 0.02, 4),
    )


@router.post("/ingest/upload", response_model=IngestResponse)
async def ingest_uploaded_pdf(
    file: UploadFile = File(..., description="The PDF file to ingest"),
    ticker: str = Form(..., examples=["AAPL"]),
    year: int = Form(..., examples=[2025]),
    quarter: QuarterEnum = Form(default=QuarterEnum.annual),
):
    """
    Same pipeline as POST /ingest, but accepts an actual uploaded file
    instead of a path to a file already on the server.

    multipart/form-data can't carry a JSON body, so each field arrives as
    its own Form(...) part alongside the File(...) part — that's why this
    doesn't reuse the IngestRequest Pydantic model like /ingest does.
    """
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    # QuarterEnum mixes in `str`, but a bare `class X(str, Enum)` (unlike
    # `enum.StrEnum`) still uses Enum's __str__/__format__ — f"{quarter}"
    # renders "QuarterEnum.annual", not "annual". Pull the plain value out
    # explicitly rather than relying on string interpolation of the enum.
    quarter_str = quarter.value

    # Sanitize the ticker before using it in a filename — it came from the
    # client and we don't want it to be able to escape RAW_DIR (e.g. "../../etc").
    safe_ticker = re.sub(r"[^A-Za-z0-9]", "", ticker).upper()
    if not safe_ticker:
        raise HTTPException(status_code=400, detail="Invalid ticker")

    os.makedirs(RAW_DIR, exist_ok=True)
    dest_path = os.path.join(RAW_DIR, f"{safe_ticker}_{year}_{quarter_str}.pdf")

    contents = await file.read()
    with open(dest_path, "wb") as f:
        f.write(contents)

    try:
        summary = ingest_document(
            pdf_path=dest_path,
            ticker=safe_ticker,
            year=year,
            quarter=quarter_str,
        )
        return _to_ingest_response(summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")