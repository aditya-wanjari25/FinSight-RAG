import { useState } from 'react'
import { askQuery } from '../api'
import QueryForm from '../components/QueryForm'
import AnswerCard from '../components/AnswerCard'

// This is exactly the container logic that used to live directly in App —
// moved here unchanged so App can now just decide *which page* to show.
function QueryPage() {
  const [form, setForm] = useState({
    query: '',
    ticker: '',
    year: '',
    quarter: 'annual',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await askQuery(form)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <QueryForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {error && (
        <p className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </p>
      )}

      {result && <AnswerCard result={result} />}
    </>
  )
}

export default QueryPage
