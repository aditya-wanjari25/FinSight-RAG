import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import CitationList from './CitationList'
import { parseAnswer } from '../utils/parseAnswer'
import { ChevronDownIcon } from './icons'

// AnswerCard composes smaller components inside itself — CitationList here,
// and ReactMarkdown (a third-party component, imported just like ours) for
// the answer body. Using someone else's component is no different from
// using our own: you pass it props, it renders.
function AnswerCard({ result }) {
  // Collapsed by default — the direct answer is the thing people scan for
  // first; evidence/analysis/citations are "proof," available on demand
  // rather than always taking up vertical space.
  const [showDetails, setShowDetails] = useState(false)

  const { answer, evidence, analysis } = parseAnswer(result.answer)
  const hasDetails = Boolean(evidence || analysis) || result.citations.length > 0

  return (
    <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-wide">
          {result.query_type}
        </span>
        <span className="text-xs text-slate-400">
          {result.chunks_retrieved} chunks retrieved
        </span>
      </div>

      {/*
        `prose` comes from @tailwindcss/typography — it styles whatever raw
        HTML tags end up inside this div (p, strong, ul, li, h1, ...) with
        sensible spacing/weight/size, without us hand-writing a className
        for every possible markdown element. `prose-slate` matches our
        slate color palette; `max-w-none` overrides prose's default
        max-width (it assumes a standalone article, but we're already
        inside a constrained card).
      */}
      <div className="prose prose-slate max-w-none prose-p:my-2">
        <ReactMarkdown>{answer}</ReactMarkdown>
      </div>

      {hasDetails && (
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            {/* rotate-180 on the chevron is the entire "expand/collapse"
                animation — no separate up/down icon needed, just flip
                the same one based on state. */}
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
            />
            {showDetails ? 'Hide reasoning & sources' : 'Show reasoning & sources'}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-4">
              {evidence && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Supporting Evidence
                  </h3>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{evidence}</ReactMarkdown>
                  </div>
                </div>
              )}

              {analysis && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Analysis
                  </h3>
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </div>
              )}

              <CitationList citations={result.citations} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnswerCard
