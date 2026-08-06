function IngestResultCard({ result }) {
  return (
    <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
          ✓
        </span>
        <p className="text-slate-900 font-medium">
          Ingested {result.ticker} {result.year}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Blocks parsed</dt>
          <dd className="text-slate-700 font-medium">{result.blocks_parsed}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Chunks stored</dt>
          <dd className="text-slate-700 font-medium">{result.chunks_stored}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Tokens used</dt>
          <dd className="text-slate-700 font-medium">{result.tokens_used.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Approx. cost</dt>
          <dd className="text-slate-700 font-medium">${result.approximate_cost_usd}</dd>
        </div>
      </dl>
    </div>
  )
}

export default IngestResultCard
