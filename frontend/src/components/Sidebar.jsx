import { UploadIcon, ChatIcon, SparkleIcon, DocumentIcon } from './icons'

// Icon lookup by nav item id, kept separate from the NAV_ITEMS data array
// in App.jsx so this component decides how each tab is drawn, while App
// only decides what tabs exist and which one is active.
const ICONS = {
  ingest: UploadIcon,
  query: ChatIcon,
}

function Sidebar({ items, activeTab, onSelect, activeDocument }) {
  const hasActiveDocument = Boolean(activeDocument?.ticker)

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 py-6 flex items-center gap-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
          <SparkleIcon className="w-4.5 h-4.5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900 leading-tight">FinSight</p>
          <p className="text-xs text-slate-400 leading-tight">Agentic RAG</p>
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = ICONS[item.id]
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Shows whatever ticker/year the user is currently working with,
          wherever it came from (a just-completed ingest, or manually
          typed into the Ask form) — a constant, low-effort reminder of
          context so switching between Upload and Ask doesn't feel like
          losing your place. */}
      <div className="mt-auto px-3 py-4 border-t border-slate-100">
        <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
          Active document
        </p>
        {hasActiveDocument ? (
          <div className="px-3 py-2 rounded-lg bg-slate-50 flex items-center gap-2">
            <DocumentIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {activeDocument.ticker} · {activeDocument.year}
              </p>
              <p className="text-xs text-slate-400 capitalize">{activeDocument.quarter}</p>
            </div>
          </div>
        ) : (
          <p className="px-3 text-sm text-slate-400">None yet — upload a filing to get started.</p>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
