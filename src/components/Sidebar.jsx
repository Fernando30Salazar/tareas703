import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const linkBase =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors'

export default function Sidebar({ open, onClose }) {
  const { profile, signOut } = useAuth()

  const links = [
    { to: '/', label: 'Panel', icon: DashboardIcon, end: true },
    { to: '/tareas', label: 'Todas las tareas', icon: ListIcon },
    { to: '/pendientes', label: 'Pendientes', icon: CircleIcon },
    { to: '/completadas', label: 'Completadas', icon: CheckIcon },
    { to: '/perfil', label: 'Mi perfil', icon: UserIcon }
  ]

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-ink px-4 py-5 text-white transition-transform md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="h-8 w-8 rounded-lg bg-accent" />
          <span className="font-display text-lg font-semibold">Tareas</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div className="grid h-8 w-8 place-content-center rounded-full bg-white/10 text-xs font-semibold">
              {(profile?.full_name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              <p className="truncate text-xs text-white/50">{profile?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
function ListIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  )
}
function CircleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 4-6 7.5-6s6 2 7.5 6" strokeLinecap="round" />
    </svg>
  )
}
