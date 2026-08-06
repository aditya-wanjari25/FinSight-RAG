# api/routes/query.py

import uuid
from fastapi import APIRouter, HTTPException
from api.schemas import QueryRequest, QueryResponse, CitationResponse
from agents.graph import run_query

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query_agent(request: QueryRequest):
    """
    Runs the FinSight agent against ingested documents.

    The agent will:
    1. Classify the query type (retrieval/comparison/calculation/summary)
    2. Retrieve relevant chunks with metadata filtering
    3. Generate a structured answer with citations

    Requires the requested ticker/year document to be ingested first.

    session_id groups this query with prior turns in ConversationMemory
    (agents/memory.py). If the client didn't send one — e.g. the first
    question in a new conversation — we mint one here and return it;
    the client is expected to send that same value on follow-up questions.
    """
    session_id = request.session_id or str(uuid.uuid4())

    try:
        result = run_query(
            query=request.query,
            ticker=request.ticker,
            year=request.year,
            quarter=request.quarter,
            session_id=session_id,
        )

        # Handle case where agent couldn't find relevant chunks
        if not result.get("final_answer"):
            raise HTTPException(
                status_code=404,
                detail=f"No answer generated. Ensure {request.ticker} "
                       f"{request.year} has been ingested."
            )

        # Build citation response objects
        citations = [
            CitationResponse(**c)
            for c in (result.get("citations") or [])
        ]

        return QueryResponse(
            answer=result["final_answer"],
            citations=citations,
            query_type=result.get("query_type", "retrieval"),
            ticker=request.ticker,
            year=request.year,
            chunks_retrieved=len(result.get("retrieved_chunks") or []),
            session_id=session_id,
        )

    except HTTPException:
        raise  # re-raise HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Agent error: {str(e)}"
        )