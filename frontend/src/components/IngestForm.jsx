// Same "controlled by props" style as QueryForm — this component just
// renders based on what its parent passes it and reports changes back up.
function IngestForm({ fields, onFieldChange, onFileChange, onSubmit, isLoading, file }) {
  return (
    <form onSubmit={onSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          PDF file
        </label>
        {/*
          <input type="file"> is special: for security reasons, browsers
          will not let JavaScript set what file is "in" the input (imagine
          a website silently pre-filling a file input with something from
          your disk). So unlike our text inputs, we do NOT pass a `value`
          prop here — this one field is allowed to manage its own displayed
          state ("uncontrolled"). We still listen with onChange, we just
          read the picked file out of `event.target.files` instead of
          `event.target.value`, and store *that* (a File object) in our
          own state up in App. From that point on, everything else about
          this form (ticker/year/quarter) stays fully controlled as before.
        */}
        <input
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="w-full border border-slate-300 rounded-md p-2 text-sm"
        />
        {file && (
          <p className="text-xs text-slate-500 mt-1">
            Selected: {file.name} ({Math.round(file.size / 1024)} KB)
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ticker
          </label>
          <input
            type="text"
            name="ticker"
            value={fields.ticker}
            onChange={onFieldChange}
            className="w-full border border-slate-300 rounded-md p-2"
            placeholder="GOOGL"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Year
          </label>
          <input
            type="number"
            name="year"
            value={fields.year}
            onChange={onFieldChange}
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
            value={fields.quarter}
            onChange={onFieldChange}
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
        disabled={isLoading || !file}
        className="w-full bg-slate-900 text-white rounded-md py-2 font-medium hover:bg-slate-700 disabled:opacity-50"
      >
        {isLoading ? 'Ingesting... (this can take a minute)' : 'Ingest PDF'}
      </button>
    </form>
  )
}

export default IngestForm
