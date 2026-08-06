import { UploadIcon } from './icons'

// Same "controlled by props" style as QueryForm — this component just
// renders based on what its parent passes it and reports changes back up.
const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ' +
  'focus:border-indigo-400 transition-shadow'
const labelClass = 'block text-xs font-medium text-slate-500 mb-1.5'

function IngestForm({ fields, onFieldChange, onFileChange, onSubmit, isLoading, file }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 space-y-4"
    >
      <div>
        <label className={labelClass}>PDF file</label>
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
        <label
          htmlFor="pdf-upload"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg py-8 px-4 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
        >
          <UploadIcon className="w-6 h-6 text-slate-400" />
          <span className="text-sm text-slate-500">
            {file ? (
              <span className="font-medium text-slate-700">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </span>
            ) : (
              <>
                <span className="text-indigo-600 font-medium">Click to choose a PDF</span>
                {' '}or drag one here
              </>
            )}
          </span>
        </label>
        <input
          id="pdf-upload"
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          className="sr-only"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Ticker</label>
          <input
            type="text"
            name="ticker"
            value={fields.ticker}
            onChange={onFieldChange}
            className={inputClass}
            placeholder="GOOGL"
          />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            name="year"
            value={fields.year}
            onChange={onFieldChange}
            className={inputClass}
            placeholder="2025"
          />
        </div>
        <div>
          <label className={labelClass}>Quarter</label>
          <select
            name="quarter"
            value={fields.quarter}
            onChange={onFieldChange}
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
        disabled={isLoading || !file}
        className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Ingesting... (this can take a minute)' : 'Ingest PDF'}
      </button>
    </form>
  )
}

export default IngestForm
