import { useState } from 'react'
import { uploadPdf } from '../api'
import IngestForm from '../components/IngestForm'
import IngestResultCard from '../components/IngestResultCard'
import { UploadIcon } from '../components/icons'

function IngestPage({ onIngested }) {
  const [file, setFile] = useState(null)

  const [fields, setFields] = useState({
    ticker: '',
    year: '',
    quarter: 'annual',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFields((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(event) {
    setFile(event.target.files[0] ?? null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!file) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await uploadPdf({ file, ...fields })
      setResult(data)

      // Tell App this is now the "active document" — the backend's ticker
      // is the sanitized version (uppercased, stripped of anything that
      // isn't alphanumeric — see api/routes/ingest.py), so we use that
      // instead of echoing back whatever the user typed in `fields`.
      onIngested?.({ ticker: data.ticker, year: data.year, quarter: fields.quarter })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <header className="mb-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-1">
          <UploadIcon className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Ingestion</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Upload a filing</h1>
        <p className="text-sm text-slate-500 mt-1">
          Parse, chunk, embed, and store a 10-K or 10-Q so you can ask questions about it.
        </p>
      </header>

      <IngestForm
        fields={fields}
        file={file}
        onFieldChange={handleFieldChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {error && (
        <p className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </p>
      )}

      {result && <IngestResultCard result={result} />}
    </>
  )
}

export default IngestPage
