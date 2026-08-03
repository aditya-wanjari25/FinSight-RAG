import ReactMarkdown from 'react-markdown'
import CitationList from './CitationList'

// AnswerCard composes smaller components inside itself — CitationList here,
// and ReactMarkdown (a third-party component, imported just like ours) for
// the answer body. Using someone else's component is no different from
// using our own: you pass it props, it renders. ReactMarkdown's main prop
// is `children` — the markdown *string* to parse — passed the normal JSX
// way, i.e. <ReactMarkdown>{result.answer}</ReactMarkdown>, not as text.
//
// This is how you build up a UI: small components combine into bigger
// ones, each one only knowing about the props it directly receives.
// AnswerCard doesn't know or care how CitationList renders a citation —
// that's CitationList's job. This separation is what makes it possible to
// change how citations look without touching AnswerCard or App at all.
function AnswerCard({ result }) {
  return (
    <div className="mt-4 bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-500">
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

        ReactMarkdown turns "**Answer**: ..." into actual <strong> tags
        instead of us seeing literal asterisks — it parses the markdown
        string into a real element tree, the same way JSX does, just at
        runtime instead of build time.
      */}
      <div className="prose prose-slate max-w-none prose-p:my-2">
        <ReactMarkdown>{result.answer}</ReactMarkdown>
      </div>

      <CitationList citations={result.citations} />
    </div>
  )
}

export default AnswerCard
