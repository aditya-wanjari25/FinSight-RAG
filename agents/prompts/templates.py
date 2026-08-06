# agents/prompts/templates.py

QUERY_ANALYSIS_TEMPLATE = """Analyze the following financial query and extract structured information.

## Conversation So Far (most recent session turns, oldest first)
{conversation_history}

## Current Query
Query: {query}
Company: {ticker}
Year: {year}

Determine:
1. query_type: one of "retrieval", "comparison", "calculation", "summary"
2. section_filter: the most relevant SEC section to search in, or null if the whole document
   Options: "Risk Factors", "MD&A", "Financial Statements", "Business", "Properties",
            "Legal Proceedings", "Controls and Procedures", "Market for Registrant"
3. comparison_year: if this is a comparison query, what second year is being compared? else null

Use the conversation so far only to resolve references the current query makes to
earlier turns (e.g. "that section", "the same risk", "what about last year") — it
does not override anything stated explicitly in the current query.

Respond in this exact JSON format with no other text:
{{
  "query_type": "retrieval",
  "section_filter": "Risk Factors",
  "comparison_year": null
}}"""


GENERATION_TEMPLATE = """Answer the following financial question using ONLY the retrieved context below.

## Conversation So Far (most recent session turns, oldest first)
{conversation_history}

## Question
{query}

## Company & Filing
Ticker: {ticker} | Year: {year} | Filing: {quarter}

## Retrieved Context
{context}

## Tool Results (if any)
{tool_results}

## Instructions
- Answer based strictly on the retrieved context — the conversation history is for
  continuity (resolving "it"/"that"/"the same period", avoiding repeating yourself),
  never a substitute source of facts
- Cite every factual claim with [Section, Page X]
- If context is insufficient, explicitly state what information is missing
- For numerical claims, always state the unit and time period
- Clearly label any interpretation as "Analysis:"
"""


COMPARISON_TEMPLATE = """Compare the following information across time periods.

## Conversation So Far (most recent session turns, oldest first)
{conversation_history}

## Question
{query}

## Period 1 Context ({year})
{context_current}

## Period 2 Context ({comparison_year})
{context_comparison}

## Instructions
- Create a structured comparison highlighting key differences
- Quantify changes where possible (e.g., "increased 12% from $X to $Y")
- Note any new risks or developments in the more recent period
- Cite every claim with [Section, Page X, Year]
- Use the conversation so far only for continuity — every factual claim must still
  come from the context above, not from anything recalled from earlier turns
"""

CROSS_COMPANY_TEMPLATE = """Compare the following information between two companies based strictly on their SEC filings.

## Conversation So Far (most recent session turns, oldest first)
{conversation_history}

## Question
{query}

## {ticker} ({year} 10-K)
{context_ticker1}

## {comparison_ticker} ({year} 10-K)
{context_ticker2}

## Instructions
- Create a structured side-by-side comparison
- Highlight key similarities and differences
- Quantify differences where possible
- Note any unique risks or strategies specific to each company
- Cite every claim with [Ticker | Section | Page]
- Do NOT use knowledge outside the provided context — conversation history is only
  for continuity (resolving "them"/"both companies"/etc.), never a source of facts
"""