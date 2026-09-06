export function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha límite'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function isOverdue(dateStr, myStatus) {
  if (!dateStr || myStatus === 'completada') return false
  const d = new Date(dateStr + 'T00:00:00')
  return d < new Date(new Date().toDateString())
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date(new Date().toDateString())
  return Math.round((d - today) / (1000 * 60 * 60 * 24))
}
