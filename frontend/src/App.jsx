import { useState } from 'react'
import QueryPage from './pages/QueryPage'
import IngestPage from './pages/IngestPage'

// A tiny plain-JS array describing our two tabs. We render this list with
// .map() below, same idea as citations — it means adding a third tab later
// is a one-line change here instead of copy-pasting a <button>.
const TABS = [
  { id: 'query', label: 'Ask a question' },
  { id: 'ingest', label: 'Upload a filing' },
]

// This is "client-side routing" in its most minimal form: no URL changes,
// no back-button support, no react-router — just a piece of state that
// says which page is active, and an if/else (here, a lookup object) that
// picks which component to render. Real apps eventually reach for a
// router library once they need shareable URLs per page, but the
// underlying idea — state decides what's on screen — is identical.
function App() {
  const [activeTab, setActiveTab] = useState('query')

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-slate-900 mb-1">
          FinSight RAG
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Ask a question about an ingested 10-K / 10-Q filing, or upload a new one.
        </p>

        <div className="flex gap-2 mb-4 border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'query' ? <QueryPage /> : <IngestPage />}
      </div>
    </div>
  )
}

export default App
