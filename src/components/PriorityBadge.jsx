const CONFIG = {
  alta: { label: 'Alta', dot: 'bg-priority-alta', text: 'text-priority-alta', bg: 'bg-priority-altaSoft' },
  media: { label: 'Media', dot: 'bg-priority-media', text: 'text-priority-media', bg: 'bg-priority-mediaSoft' },
  baja: { label: 'Baja', dot: 'bg-priority-baja', text: 'text-priority-baja', bg: 'bg-priority-bajaSoft' }
}

export default function PriorityBadge({ priority }) {
  const c = CONFIG[priority] || CONFIG.media
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
