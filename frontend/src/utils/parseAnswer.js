// The backend's system prompt (agents/prompts/system.py) instructs GPT-4o
// to always structure its answer as four labeled markdown sections:
// **Answer**, **Supporting Evidence**, **Analysis**, **Sources**. We parse
// those out client-side so the UI can show the direct answer prominently
// and tuck the reasoning/evidence behind a collapsible section — no
// backend change needed, since the sections are already consistently
// present in result.answer as one long markdown string.
//
// This is a best-effort parse of LLM output, not a strict contract the
// model is bound to. If the expected headers aren't found — a reworded
// response, a future prompt change, a different model — we fall back to
// treating the whole string as the answer. Worse formatting, never a
// crash or missing content.

const SECTION_PATTERN = /\*\*(Answer|Supporting Evidence|Analysis|Sources)\*\*:?/gi

export function parseAnswer(markdown) {
  const matches = [...markdown.matchAll(SECTION_PATTERN)]

  if (matches.length === 0) {
    return { answer: markdown, evidence: null, analysis: null }
  }

  const sections = {}
  matches.forEach((match, i) => {
    const name = match[1].toLowerCase()
    const start = match.index + match[0].length
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length
    sections[name] = markdown.slice(start, end).trim()
  })

  return {
    answer: sections['answer'] ?? markdown,
    evidence: sections['supporting evidence'] ?? null,
    analysis: sections['analysis'] ?? null,
    // sections['sources'] is intentionally dropped here — CitationList
    // already renders the same information from result.citations
    // (structured data from the API), so showing it a second time as raw
    // text would just be noise.
  }
}
