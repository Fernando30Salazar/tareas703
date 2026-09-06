import ProgressRing from './ProgressRing'
import PriorityBadge from './PriorityBadge'
import { formatDate, daysUntil } from '../utils/date'
import { useAuth } from '../context/AuthContext'

export default function Dashboard({ stats }) {
  const { profile } = useAuth()

  const cards = [
    { label: 'Total de tareas', value: stats.total },
    { label: 'Pendientes', value: stats.pendientes },
    { label: 'Completadas', value: stats.completadas }
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted">Hola, {profile?.full_name?.split(' ')[0] || ''}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
          Este es tu progreso, solo tuyo.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-line bg-surface p-5">
          <div className="flex items-center gap-4">
            <ProgressRing percentage={stats.porcentaje} />
            <div>
              <p className="text-sm text-muted">Progreso individual</p>
              <p className="font-display text-lg font-semibold text-ink">{stats.porcentaje}% completado</p>
            </div>
          </div>
        </div>
        {cards.map((c) => (
          <div key={c.label} className="rounded-card border border-line bg-surface p-5">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Próximas a vencer (3 días)</h3>
        <div className="rounded-card border border-line bg-surface px-4">
          {stats.proximasAVencer.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No tienes tareas por vencer en los próximos días.
            </p>
          ) : (
            stats.proximasAVencer.map((t) => {
              const d = daysUntil(t.due_date)
              return (
                <div key={t.id} className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                    <p className="text-xs text-muted">{formatDate(t.due_date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <span className="text-xs text-muted">
                      {d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
