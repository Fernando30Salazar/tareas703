import { useAuth } from '../context/AuthContext'
import ProgressRing from './ProgressRing'

export default function ProfilePage({ stats }) {
  const { profile } = useAuth()

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-card border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-content-center rounded-full bg-accent-soft text-lg font-semibold text-accent-dark">
            {(profile?.full_name || '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">{profile?.full_name}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
            {profile?.is_admin && (
              <span className="mt-1 inline-block rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-dark">
                Usuario autorizado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface p-6">
        <div className="flex items-center gap-5">
          <ProgressRing percentage={stats.porcentaje} size={96} />
          <div className="space-y-1 text-sm">
            <p className="text-ink">
              <span className="font-semibold">{stats.completadas}</span> de{' '}
              <span className="font-semibold">{stats.total}</span> tareas completadas
            </p>
            <p className="text-muted">{stats.pendientes} pendientes por resolver</p>
          </div>
        </div>
      </div>
    </div>
  )
}
