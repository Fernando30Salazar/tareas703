import { useState } from 'react'
import PriorityBadge from './PriorityBadge'
import { formatDate, isOverdue } from '../utils/date'

export default function TaskItem({ task, isAdmin, onToggle, onHide, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false)
  const completed = task.myStatus === 'completada'
  const overdue = isOverdue(task.due_date, task.myStatus)

  return (
    <div className="group flex items-start gap-3 border-b border-line px-1 py-3.5 last:border-b-0">
      <input
        type="checkbox"
        className="task-checkbox mt-0.5"
        checked={completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Marcar "${task.title}" como ${completed ? 'pendiente' : 'completada'}`}
      />

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${completed ? 'text-muted line-through' : 'text-ink'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className={`mt-0.5 text-sm ${completed ? 'text-muted/70' : 'text-muted'}`}>
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <span className={`text-xs ${overdue ? 'font-medium text-priority-alta' : 'text-muted'}`}>
            {overdue ? 'Vencida · ' : ''}
            {formatDate(task.due_date)}
          </span>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <button
          onClick={() => setOpenMenu((v) => !v)}
          className="grid h-8 w-8 place-content-center rounded-lg text-muted opacity-0 transition-opacity hover:bg-canvas group-hover:opacity-100"
          aria-label="Más acciones"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <circle cx="5" cy="12" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="19" cy="12" r="1.8" />
          </svg>
        </button>
        {openMenu && (
          <div
            className="absolute right-0 top-9 z-10 w-44 rounded-lg border border-line bg-surface py-1 shadow-lg"
            onMouseLeave={() => setOpenMenu(false)}
          >
            {completed && (
              <button
                onClick={() => {
                  onHide(task.id)
                  setOpenMenu(false)
                }}
                className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
              >
                Ocultar de mi vista
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  onClick={() => {
                    onEdit(task)
                    setOpenMenu(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-canvas"
                >
                  Editar tarea
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id)
                    setOpenMenu(false)
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-priority-alta hover:bg-canvas"
                >
                  Eliminar para todos
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
