// QueryForm doesn't own any state itself — it receives `form` (what to
// display) and three callback functions (`onChange`, `onSubmit`) as props
// from its parent, and just renders based on them. This is called a
// "controlled" / "presentational" component: given the same props, it
// always renders the same thing, and it never reaches into its parent's
// state directly — it only calls the functions the parent handed it.
//
// Props are read-only. QueryForm cannot do `form.ticker = 'x'` — the only
// way it can affect anything is by calling onChange/onSubmit and trusting
// the parent to update its own state, which then flows back down as new
// props. Data flows one way: parent -> child via props, child -> parent
// via callback functions. This is "unidirectional data flow."
function QueryForm({ form, onChange, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Question
        </label>
        <textarea
          name="query"
          value={form.query}
          onChange={onChange}
          className="w-full border border-slate-300 rounded-md p-2"
          rows={3}
          placeholder="What are the main risk factors for Apple in 2025?"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ticker
          </label>
          <input
            type="text"
            name="ticker"
            value={form.ticker}
            onChange={onChange}
            className="w-full border border-slate-300 rounded-md p-2"
            placeholder="AAPL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Year
          </label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={onChange}
            className="w-full border border-slate-300 rounded-md p-2"
            placeholder="2025"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Quarter
          </label>
          <select
            name="quarter"
            value={form.quarter}
            onChange={onChange}
            className="w-full border border-slate-300 rounded-md p-2"
          >
            <option value="annual">Annual</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-slate-900 text-white rounded-md py-2 font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {isLoading ? 'Asking...' : 'Ask'}
      </button>
    </form>
  )
}

export default QueryForm
