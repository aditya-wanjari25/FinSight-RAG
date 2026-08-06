import { useState, useEffect } from 'react'
import { askQuery } from '../api'
import QueryForm from '../components/QueryForm'
import QueryTurn from '../components/QueryTurn'
import { ChatIcon } from '../components/icons'

const SESSION_STORAGE_KEY = 'finsight_session_id'
const TURNS_STORAGE_KEY = 'finsight_turns'

function QueryPage({ activeDocument, onDocumentChange }) {
  // Ticker/year/quarter are seeded from activeDocument (owned by App, see
  // App.jsx) instead of blank strings — this is the actual fix for "don't
  // make me retype the ticker every time": whatever was last ingested, or
  // last typed here, is already sitting in the form on arrival.
  const [form, setForm] = useState({
    query: '',
    ticker: activeDocument?.ticker ?? '',
    year: activeDocument?.year ?? '',
    quarter: activeDocument?.quarter ?? 'annual',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const [turns, setTurns] = useState(() => {
    const stored = sessionStorage.getItem(TURNS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  // useEffect runs a side effect (something that reaches OUTSIDE React —
  // here, writing to the browser's sessionStorage) after render, whenever
  // the values in its dependency array change. This is the textbook
  // useEffect use case: "keep this external system in sync with this
  // piece of state" — every time `turns` changes, re-save it. Contrast
  // with handleSubmit, which fires because of a user action (a click);
  // this fires because a piece of state changed, for any reason.
  useEffect(() => {
    sessionStorage.setItem(TURNS_STORAGE_KEY, JSON.stringify(turns))
  }, [turns])

  const [sessionId, setSessionId] = useState(() =>
    sessionStorage.getItem(SESSION_STORAGE_KEY)
  )

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      // Ticker/year/quarter changes propagate up to App immediately (not
      // just on submit) — so if the user manually corrects the ticker,
      // that becomes the new remembered value right away, and switching
      // to the Upload tab and back doesn't lose it.
      if (name !== 'query') {
        onDocumentChange?.({ ticker: next.ticker, year: next.year, quarter: next.quarter })
      }
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setIsLoading(true)
    setError(null)

    try {
      const data = await askQuery({ ...form, sessionId })

      sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id)
      setSessionId(data.session_id)

      const turnId = crypto.randomUUID()
      setTurns((prev) => [...prev, { id: turnId, query: form.query, result: data }])
      setForm((prev) => ({ ...prev, query: '' })) // clear the question, keep ticker/year/quarter
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  function handleNewConversation() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    sessionStorage.removeItem(TURNS_STORAGE_KEY)
    setSessionId(null)
    setTurns([])
    setError(null)
  }

  return (
    <>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <ChatIcon className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {sessionId ? `Session ${sessionId.slice(0, 8)}` : 'New session'}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Ask a question</h1>
          <p className="text-sm text-slate-500 mt-1">
            Answers are grounded in the filing's retrieved context, with citations.
          </p>
        </div>
        {turns.length > 0 && (
          <button
            type="button"
            onClick={handleNewConversation}
            className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-full px-3 py-1.5 hover:border-slate-300 transition-colors"
          >
            New conversation
          </button>
        )}
      </header>

      <QueryForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {error && (
        <p className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          {error}
        </p>
      )}

      {turns.map((turn) => (
        <QueryTurn key={turn.id} turn={turn} />
      ))}
    </>
  )
}

export default QueryPage
