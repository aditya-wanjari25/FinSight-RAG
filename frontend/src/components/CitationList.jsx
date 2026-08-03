// A small, focused component: given an array of citations, render them.
// Nothing else. This is the level most components in a real app end up
// at — a handful of lines, one job, easy to reason about in isolation.
function CitationList({ citations }) {
  if (citations.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-700 mb-2">Sources</h3>
      <ul className="space-y-1">
        {citations.map((citation, index) => (
          <li
            key={`${citation.section}-${citation.page}-${index}`}
            className="text-sm text-slate-600 border-l-2 border-slate-300 pl-3"
          >
            {citation.ticker} {citation.year} — {citation.section}, page{' '}
            {citation.page}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CitationList
