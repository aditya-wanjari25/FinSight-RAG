// QueryForm doesn't own any state itself — it receives `form` (what to
// display) and callback functions (`onChange`, `onSubmit`) as props from
// its parent, and just renders based on them. This is called a
// "controlled" / "presentational" component: given the same props, it
// always renders the same thing, and it never reaches into its parent's
// state directly — it only calls the functions the parent handed it.
//
// Props are read-only. QueryForm cannot do `form.ticker = 'x'` — the only
// way it can affect anything is by calling onChange/onSubmit and trusting
// the parent to update its own state, which then flows back down as new
// props. Data flows one way: parent -> child via props, child -> parent
// via callback functions. This is "unidirectional data flow."
const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ' +
  'focus:border-indigo-400 transition-shadow'
const labelClass = 'block text-xs font-medium text-slate-500 mb-1.5'

function QueryForm({ form, onChange, onSubmit, isLoading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4"
    >
      <div>
        <label className={labelClass}>Question</label>
        <textarea
          name="query"
          value={form.query}
          onChange={onChange}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="What are the main risk factors for Apple in 2025?"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Ticker</label>
          <input
            type="text"
            name="ticker"
            value={form.ticker}
            onChange={onChange}
            className={inputClass}
            placeholder="AAPL"
          />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            name="year"
            value={form.year}
            onChange={onChange}
            className={inputClass}
            placeholder="2025"
          />
        </div>
        <div>
          <label className={labelClass}>Quarter</label>
          <select
            name="quarter"
            value={form.quarter}
            onChange={onChange}
            className={inputClass}
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
        className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Asking...' : 'Ask'}
      </button>
    </form>
  )
}

export default QueryForm
