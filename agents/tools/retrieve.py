# agents/tools/retrieve.py

from retrieval.hybrid_retriever import HybridRetriever
from retrieval.reranker import get_reranker
from agents.state import RetrievedChunk
from dotenv import load_dotenv

load_dotenv()

# How many candidates to pull from hybrid search before reranking. RRF
# fusion (hybrid_retriever.py) ranks by lexical/semantic similarity to the
# QUESTION's phrasing — a chunk that merely talks about the topic can
# outrank a chunk that actually contains the answer (e.g. "the Company
# introduces new products" out-scoring a chunk that just lists "iPhone 17,
# iPhone Air, Apple Watch Series 11..." with none of the query's words in
# it). Pulling a wider pool here gives such chunks a chance to survive
# RRF's cut; the reranker below is what actually promotes them back up.
RERANK_CANDIDATE_POOL = 20


class RetrieveTool:
    """
    Hybrid retrieval tool with metadata filtering, followed by cross-encoder
    reranking.

    Pipeline: hybrid search (BM25 + vector, RRF-fused) → wide candidate
    pool → cross-encoder reranks by actual (query, chunk) relevance →
    top-n returned.

    The key difference from naive RAG:
    - Naive RAG: embed query → search ALL chunks → return top 5
    - Our approach: filter by ticker/year/section first, run hybrid search
      within that subset, then rerank before cutting to the final top-n

    Why rerank on top of hybrid search? BM25 and vector similarity both
    compare the CHUNK to the QUERY independently — they're good at finding
    chunks that are topically related, but they can't tell "this chunk
    contains the answer" from "this chunk talks about the same subject."
    A cross-encoder reads the query and chunk TOGETHER, so it can make
    that distinction — at the cost of being too slow to run over an entire
    corpus, which is why it only sees the top RERANK_CANDIDATE_POOL
    candidates hybrid search already narrowed things down to.

    Why does this matter for finance?
    If you have 5 companies × 3 years = 15 documents in your vector store,
    a naive search for "revenue risk" might return chunks from the wrong
    company or wrong year. Metadata filtering prevents this entirely.
    """

    def __init__(self, collection_name: str = "finsight"):
        self.retriever = HybridRetriever()

    def run(
        self,
        query: str,
        ticker: str,
        year: int,
        n_results: int = 5,
        section_filter: str = None,
        chunk_type_filter: str = None,  # "text" | "table" | None
    ) -> list[RetrievedChunk]:
        """
        Runs hybrid BM25 + vector retrieval, reranks with a cross-encoder,
        and returns the top-n chunks.

        Args:
            query:              The search query (usually the user's question)
            ticker:             Filter to this company only
            year:               Filter to this fiscal year only
            n_results:          How many chunks to return, after reranking
            section_filter:     Optional — narrow to a specific SEC section
            chunk_type_filter:  Optional — return only tables or only text

        Returns:
            List of RetrievedChunk dicts ordered by reranker score
        """
        candidates = self.retriever.retrieve(
            query=query,
            ticker=ticker,
            year=year,
            n_results=max(n_results, RERANK_CANDIDATE_POOL),
            section_filter=section_filter,
            chunk_type_filter=chunk_type_filter,
        )

        # min_score is deliberately disabled (not left at Reranker's
        # default of 0.0). The cross-encoder outputs a raw, unbounded
        # logit, not a normalized probability — for this model, the
        # single best-matching candidate in a batch is often still
        # negative (observed as low as -1 to -3 even for the correct
        # chunk). A min_score of 0.0 would silently drop most or all
        # candidates in exactly that situation. We want the best
        # n_results candidates, full stop — not "only candidates above an
        # absolute confidence bar," which isn't a threshold this model's
        # raw score actually supports.
        return get_reranker().rerank(
            query=query, chunks=candidates, top_k=n_results, min_score=float("-inf")
        )
