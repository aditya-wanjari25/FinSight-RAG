function IngestResultCard({ result }) {
  return (
    <div className="mt-4 bg-white rounded-lg shadow p-6 space-y-2">
      <p className="text-emerald-700 font-medium">
        ✅ Ingested {result.ticker} {result.year}
      </p>
      <dl className="grid grid-cols-2 gap-y-1 text-sm text-slate-600">
        <dt>Blocks parsed</dt>
        <dd>{result.blocks_parsed}</dd>
        <dt>Chunks stored</dt>
        <dd>{result.chunks_stored}</dd>
        <dt>Tokens used</dt>
        <dd>{result.tokens_used.toLocaleString()}</dd>
        <dt>Approx. cost</dt>
        <dd>${result.approximate_cost_usd}</dd>
      </dl>
    </div>
  )
}

export default IngestResultCard
