import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

// Este hook es el núcleo de la plataforma:
// - `tasks` viene de la tabla global `tasks` (igual para todos).
// - `progressByTask` viene de `task_progress` FILTRADA por el usuario actual,
//   así que el estado que ve cada usuario es 100% independiente.
export function useTasks() {
  const { session, profile } = useAuth()
  const userId = session?.user?.id

  const [tasks, setTasks] = useState([])
  const [progressByTask, setProgressByTask] = useState({})
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    const [{ data: taskRows, error: taskErr }, { data: progressRows, error: progErr }] =
      await Promise.all([
        supabase.from('tasks').select('*').order('due_date', { ascending: true, nullsFirst: false }),
        supabase.from('task_progress').select('*').eq('user_id', userId)
      ])

    if (!taskErr) setTasks(taskRows || [])
    if (!progErr) {
      const map = {}
      ;(progressRows || []).forEach((p) => {
        map[p.task_id] = p
      })
      setProgressByTask(map)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Suscripción en tiempo real: cuando alguien crea/edita/elimina una tarea
  // global, todos los usuarios la ven aparecer al instante. Los cambios de
  // progreso solo llegan filtrados al propio usuario.
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('realtime-tasks-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        setTasks((prev) => {
          if (payload.eventType === 'INSERT') return [...prev, payload.new]
          if (payload.eventType === 'UPDATE')
            return prev.map((t) => (t.id === payload.new.id ? payload.new : t))
          if (payload.eventType === 'DELETE') return prev.filter((t) => t.id !== payload.old.id)
          return prev
        })
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_progress', filter: `user_id=eq.${userId}` },
        (payload) => {
          setProgressByTask((prev) => {
            const next = { ...prev }
            if (payload.eventType === 'DELETE') {
              delete next[payload.old.task_id]
            } else {
              next[payload.new.task_id] = payload.new
            }
            return next
          })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // ---- Gestión de tareas globales (solo usuarios autorizados; RLS lo refuerza en el servidor) ----
  const createTask = useCallback(
    async ({ title, description, due_date, priority }) => {
      return supabase
        .from('tasks')
        .insert({ title, description, due_date, priority, created_by: userId })
        .select()
        .single()
    },
    [userId]
  )

  const updateTask = useCallback(async (taskId, patch) => {
    return supabase.from('tasks').update(patch).eq('id', taskId)
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    return supabase.from('tasks').delete().eq('id', taskId)
  }, [])

  // ---- Progreso individual (siempre acotado a auth.uid() por RLS) ----
  const setTaskStatus = useCallback(
    async (taskId, status) => {
      const patch = {
        user_id: userId,
        task_id: taskId,
        status,
        completed_at: status === 'completada' ? new Date().toISOString() : null
      }
      // optimista: refleja el cambio de inmediato en la UI propia
      setProgressByTask((prev) => ({ ...prev, [taskId]: { ...prev[taskId], ...patch } }))
      return supabase.from('task_progress').upsert(patch, { onConflict: 'user_id,task_id' })
    },
    [userId]
  )

  const toggleTaskStatus = useCallback(
    (taskId) => {
      const current = progressByTask[taskId]?.status || 'pendiente'
      return setTaskStatus(taskId, current === 'completada' ? 'pendiente' : 'completada')
    },
    [progressByTask, setTaskStatus]
  )

  const hideFromMyView = useCallback(
    async (taskId, hidden = true) => {
      setProgressByTask((prev) => ({
        ...prev,
        [taskId]: { ...prev[taskId], hidden }
      }))
      return supabase
        .from('task_progress')
        .upsert({ user_id: userId, task_id: taskId, hidden }, { onConflict: 'user_id,task_id' })
    },
    [userId]
  )

  // ---- Vista combinada: tarea + mi estado individual ----
  const myTasks = useMemo(() => {
    return tasks
      .map((t) => ({
        ...t,
        myStatus: progressByTask[t.id]?.status || 'pendiente',
        myHidden: progressByTask[t.id]?.hidden || false,
        myCompletedAt: progressByTask[t.id]?.completed_at || null
      }))
      .filter((t) => !t.myHidden)
  }, [tasks, progressByTask])

  const stats = useMemo(() => {
    const total = myTasks.length
    const completadas = myTasks.filter((t) => t.myStatus === 'completada').length
    const pendientes = total - completadas
    const porcentaje = total === 0 ? 0 : Math.round((completadas / total) * 100)

    const hoy = new Date()
    const en3dias = new Date()
    en3dias.setDate(hoy.getDate() + 3)
    const proximasAVencer = myTasks.filter((t) => {
      if (!t.due_date || t.myStatus === 'completada') return false
      const due = new Date(t.due_date + 'T00:00:00')
      return due >= new Date(hoy.toDateString()) && due <= en3dias
    })

    return { total, completadas, pendientes, porcentaje, proximasAVencer }
  }, [myTasks])

  return {
    loading,
    myTasks,
    stats,
    isAdmin: !!profile?.is_admin,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    hideFromMyView,
    reload: loadAll
  }
}
