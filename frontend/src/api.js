// Talks to the FastAPI backend. Kept separate from App.jsx so the component
// only worries about rendering — not about URLs, headers, or JSON parsing.

export async function askQuery({ query, ticker, year, quarter, sessionId }) {
  const response = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      ticker,
      year: Number(year), // the <input type="number"> still gives us a string
      quarter,
      // If sessionId is undefined (no session yet), JSON.stringify drops
      // this key from the body entirely; if it's null, the key is kept
      // with a JSON null value. Either way, the backend's
      // `session_id: Optional[str] = Field(default=None)` treats a
      // missing key and an explicit null identically — both become None.
      session_id: sessionId,
    }),
  })

  if (!response.ok) {
    // FastAPI's HTTPException body looks like { "detail": "..." } — surface
    // that message if we can, otherwise fall back to the HTTP status.
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `Request failed with status ${response.status}`)
  }

  return response.json() // resolves to the QueryResponse shape from schemas.py
}

export async function uploadPdf({ file, ticker, year, quarter }) {
  // FormData is the browser API for building a multipart/form-data body —
  // the format used for file uploads. Unlike askQuery above, we do NOT set
  // 'Content-Type' ourselves: the browser has to generate a boundary string
  // (a random separator between parts) and put it in the header for us. If
  // you set Content-Type manually here, the boundary won't match and the
  // backend will fail to parse the request.
  const formData = new FormData()
  formData.append('file', file) // a File object, not a string
  formData.append('ticker', ticker)
  formData.append('year', String(year))
  formData.append('quarter', quarter)

  const response = await fetch('/api/ingest/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `Upload failed with status ${response.status}`)
  }

  return response.json() // resolves to the IngestResponse shape from schemas.py
}
