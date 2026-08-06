# agents/memory.py
#
# Session-scoped conversation memory.
#
# Storage: a plain in-process Python dict, keyed by session_id. This is
# the simplest thing that actually works — no new infrastructure — but it
# comes with two honest tradeoffs, worth knowing rather than discovering
# in production:
#   1. Restarting the API process wipes every session's history.
#   2. If you ever run more than one uvicorn worker (or scale to multiple
#      machines), each process has its OWN dict — a user's follow-up
#      question might land on a worker that never saw their first question.
# Both are solved the same way later: swap this dict for Redis (or any
# shared store) behind the exact same ConversationMemory interface below,
# without touching any of the code that calls it.
#
# This is deliberately NOT LangGraph's built-in checkpointer (MemorySaver +
# thread_id), which persists the *entire graph state* between invocations.
# That's the "correct" long-term answer, but it requires restructuring
# SupervisorState around an accumulating message list with reducers —
# more machinery than a first pass at session memory needs. This class is
# a small, explicit layer the API calls directly: read history in, run the
# stateless graph, write the new turn out. Simpler to reason about, and a
# clean interface to later replace with the LangGraph-native approach.

from dataclasses import dataclass, field
from datetime import datetime, timezone

# Bounds how many past turns get recalled per session. This directly
# trades off against prompt size / cost / latency — every recalled turn's
# question+answer gets re-sent as context on every subsequent request in
# the session. Uncapped history in a long-running chat would eventually
# blow past the model's context window (see the earlier latency/context
# discussion — this is the same tradeoff, just applied to memory instead
# of retrieval).
MAX_TURNS_PER_SESSION = 5

# Each recalled answer is truncated to this many characters when formatted
# for prompt injection. A SummarizationAgent answer can run to a couple
# thousand characters — five of those, verbatim, would dominate the next
# request's prompt. We only need enough of the prior answer for the model
# to recall *what was discussed*, not reproduce it exactly.
MAX_ANSWER_CHARS_IN_HISTORY = 500


@dataclass
class Turn:
    """One question/answer pair in a session's history."""
    query: str
    answer: str
    ticker: str
    year: int
    query_type: str
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class ConversationMemory:
    """
    Keyed by session_id -> list[Turn], oldest first. One shared instance
    (created at the bottom of this module) is imported everywhere that
    needs to read or write history, so all requests in the same process
    see the same session state.
    """

    def __init__(self, max_turns: int = MAX_TURNS_PER_SESSION):
        self._sessions: dict[str, list[Turn]] = {}
        self.max_turns = max_turns

    def add_turn(
        self,
        session_id: str,
        query: str,
        answer: str,
        ticker: str,
        year: int,
        query_type: str,
    ) -> None:
        """Appends a turn, then trims to the most recent `max_turns`."""
        turns = self._sessions.setdefault(session_id, [])
        turns.append(
            Turn(query=query, answer=answer, ticker=ticker, year=year, query_type=query_type)
        )
        if len(turns) > self.max_turns:
            self._sessions[session_id] = turns[-self.max_turns:]

    def get_history(self, session_id: str) -> list[Turn]:
        return self._sessions.get(session_id, [])

    def format_history(self, session_id: str) -> str:
        """
        Renders history as plain text for prompt injection. Returns a
        plain-English placeholder for a new/unknown session_id, so every
        prompt template can drop {conversation_history} straight in
        without a separate "is this the first turn?" branch of its own.
        """
        turns = self.get_history(session_id)
        if not turns:
            return "(No previous questions in this session — this is the first turn.)"

        lines = []
        for i, turn in enumerate(turns, start=1):
            answer = turn.answer
            if len(answer) > MAX_ANSWER_CHARS_IN_HISTORY:
                answer = answer[:MAX_ANSWER_CHARS_IN_HISTORY] + "..."
            lines.append(
                f"Turn {i} — {turn.ticker} {turn.year} ({turn.query_type}):\n"
                f"  User asked: {turn.query}\n"
                f"  Agent answered: {answer}"
            )
        return "\n\n".join(lines)

    def clear_session(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


# Single shared instance. Import THIS, not the class, from every caller —
# `from agents.memory import conversation_memory` — so everyone reads and
# writes the same underlying dict.
conversation_memory = ConversationMemory()
