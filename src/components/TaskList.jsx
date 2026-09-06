import { useMemo, useState } from 'react'
import TaskItem from './TaskItem'

const PRIORITY_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' }
]

export default function TaskList({ tasks, isAdmin, onToggle, onHide, onEdit, onDelete, emptyMessage }) {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('todas')

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => priorityFilter === 'todas' || t.priority === priorityFilter)
      .filter((t) => t.title.toLowerCase().includes(search.trim().toLowerCase()))
  }, [tasks, search, priorityFilter])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarea…"
          className="w-full max-w-xs rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <div className="flex gap-1.5 overflow-x-auto">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPriorityFilter(opt.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                priorityFilter === opt.value
                  ? 'bg-ink text-white'
                  : 'bg-surface text-muted border border-line hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface px-4">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">
            {emptyMessage || 'No hay tareas que coincidan con este filtro.'}
          </p>
        ) : (
          filtered.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isAdmin={isAdmin}
              onToggle={onToggle}
              onHide={onHide}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
