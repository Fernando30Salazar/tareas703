export default function Topbar({ title, onMenuClick, action }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/90 px-4 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="grid h-9 w-9 place-content-center rounded-lg border border-line bg-surface md:hidden"
          aria-label="Abrir menú"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="font-display text-xl font-semibold text-ink md:text-2xl">{title}</h1>
      </div>
      {action}
    </header>
  )
}
