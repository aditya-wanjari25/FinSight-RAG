import { useState } from 'react'
import Sidebar from './components/Sidebar'
import QueryPage from './pages/QueryPage'
import IngestPage from './pages/IngestPage'

const ACTIVE_DOC_KEY = 'finsight_active_document'
const DEFAULT_DOCUMENT = { ticker: '', year: '', quarter: 'annual' }

// Nav order matches what was asked for: Upload first, then Ask. This list
// drives both the sidebar (Sidebar.jsx) and which page renders below —
// one source of truth instead of two places that could drift out of sync.
const NAV_ITEMS = [
  { id: 'ingest', label: 'Upload a filing' },
  { id: 'query', label: 'Ask a question' },
]

function App() {
  const [activeTab, setActiveTab] = useState('ingest')

  // "Active document" = whichever ticker/year/quarter the user is
  // currently working with. It's owned here, in the nearest common
  // ancestor of IngestPage and QueryPage, because both need to read AND
  // write it: ingesting a filing sets it, asking a question also updates
  // it (if the user changes ticker), and both pages need to read the
  // current value. This is the same "lift state up" pattern as the query
  // form fields — just one level higher, since now two whole pages share it.
  const [activeDocument, setActiveDocumentState] = useState(() => {
    const stored = sessionStorage.getItem(ACTIVE_DOC_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_DOCUMENT
  })

  function setActiveDocument(doc) {
    setActiveDocumentState(doc)
    sessionStorage.setItem(ACTIVE_DOC_KEY, JSON.stringify(doc))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar
        items={NAV_ITEMS}
        activeTab={activeTab}
        onSelect={setActiveTab}
        activeDocument={activeDocument}
      />

      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-6 py-10 md:px-10">
          {activeTab === 'ingest' ? (
            <IngestPage
              activeDocument={activeDocument}
              onIngested={setActiveDocument}
            />
          ) : (
            <QueryPage
              activeDocument={activeDocument}
              onDocumentChange={setActiveDocument}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
