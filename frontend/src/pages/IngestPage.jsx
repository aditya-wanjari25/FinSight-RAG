import { useState } from 'react'
import { uploadPdf } from '../api'
import IngestForm from '../components/IngestForm'
import IngestResultCard from '../components/IngestResultCard'

function IngestPage() {
  // The file itself lives in its own piece of state, separate from the
  // text fields — it's a different *kind* of value (a File object, not a
  // string) and it's set from event.target.files instead of .value.
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
    // event.target.files is a FileList (even for a single-file input) —
    // grab the first entry. It'll be undefined if the user cancels the
    // file picker without choosing anything.
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
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <IngestForm
        fields={fields}
        file={file}
        onFieldChange={handleFieldChange}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {error && (
        <p className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {result && <IngestResultCard result={result} />}
    </>
  )
}

export default IngestPage
