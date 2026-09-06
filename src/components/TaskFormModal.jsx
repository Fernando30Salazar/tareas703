import { useState, useEffect } from 'react'

export default function TaskFormModal({ open, onClose, onSubmit, initialTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('media')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(initialTask?.title || '')
      setDescription(initialTask?.description || '')
      setDueDate(initialTask?.due_date || '')
      setPriority(initialTask?.priority || 'media')
    }
  }, [open, initialTask])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSubmit({ title, description, due_date: dueDate || null, priority })
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-card border border-line bg-surface p-6 shadow-xl"
      >
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">
          {initialTask ? 'Editar tarea' : 'Nueva tarea'}
        </h2>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-ink">Título</span>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Ej. Realizar publicación para Instagram"
          />
        </label>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-ink">Descripción</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Detalles opcionales"
          />
        </label>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Fecha límite</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-ink">Prioridad</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-canvas"
          >
            Cancelar
          </button>
          <button
            disabled={busy}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {initialTask ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </form>
    </div>
  )
}
