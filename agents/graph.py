# agents/graph.py
#
# Public entry point for the multi-agent system.
# The API and evaluation modules call run_query() — nothing else should change.
#
# Architecture:
#   SupervisorGraph (classify → route)
#     ├── RetrievalAgent    (retrieve → generate)
#     ├── ComparisonAgent   (retrieve → generate)
#     ├── CalculationAgent  (retrieve → generate)
#     ├── SummarizationAgent(retrieve → generate)
#     └── CrossCompanyAgent (retrieve → generate)

from agents.supervisor import build_supervisor
from agents.state import SupervisorState
from agents.observability import get_langsmith_config
from agents.memory import conversation_memory

supervisor = build_supervisor()


def run_query(
    query: str,
    ticker: str,
    year: int,
    quarter: str = "annual",
    session_id: str | None = None,
) -> dict:
    """
    Runs the multi-agent system against ingested documents.

    The supervisor classifies the query and delegates to the appropriate
    specialist agent. Each specialist has its own retrieve → generate graph.

    session_id is optional and opt-in: pass one to get session-scoped
    conversation memory (prior turns get recalled into the prompts, and
    this turn gets written back for the next call to see). Callers that
    don't pass one — e.g. the RAGAS eval script, where each question is
    independent — get the exact same stateless behavior as before.

    Returns the final SupervisorState dict, which includes:
      - final_answer (str)
      - citations    (list[Citation])
      - query_type   (str)
      - retrieved_chunks (list[RetrievedChunk])
    """
    # Read history BEFORE the graph runs — conversation_history is a
    # read-only input to the graph, same as query/ticker/year. No node
    # writes to it; it's populated here, once, from outside the graph.
    conversation_history = (
        conversation_memory.format_history(session_id) if session_id else ""
    )

    initial_state: SupervisorState = {
        "query": query,
        "ticker": ticker,
        "year": year,
        "quarter": quarter,
        "query_type": None,
        "comparison_year": None,
        "comparison_ticker": None,
        "section_filter": None,
        "retrieved_chunks": None,
        "final_answer": None,
        "citations": None,
        "error": None,
        "is_out_of_scope": None,
        "conversation_history": conversation_history,
    }

    langsmith_config = get_langsmith_config(
        run_name=f"{ticker} {year} — {query[:50]}",
        tags=[ticker, str(year), quarter],
        metadata={
            "ticker": ticker,
            "year": year,
            "quarter": quarter,
            "query_preview": query[:100],
        },
    )

    if langsmith_config:
        result = supervisor.invoke(initial_state, config=langsmith_config)
    else:
        result = supervisor.invoke(initial_state)

    # Write this turn back AFTER the graph finishes, so the NEXT call with
    # the same session_id recalls it. This is why memory works even though
    # the graph itself is fully stateless per-invocation — the statefulness
    # lives entirely in this read-before / write-after wrapper.
    if session_id and result.get("final_answer"):
        conversation_memory.add_turn(
            session_id=session_id,
            query=query,
            answer=result["final_answer"],
            ticker=ticker,
            year=year,
            query_type=result.get("query_type") or "retrieval",
        )

    return result
