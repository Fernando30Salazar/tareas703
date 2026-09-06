import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useTasks } from './hooks/useTasks'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import TaskList from './components/TaskList'
import TaskFormModal from './components/TaskFormModal'
import ProfilePage from './components/ProfilePage'

export default function App() {
  const { session, loading: authLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const {
    loading,
    myTasks,
    stats,
    isAdmin,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    hideFromMyView
  } = useTasks()

  if (authLoading) return <FullScreenSpinner />
  if (!session) return <Login />

  const openCreateModal = () => {
    setEditingTask(null)
    setModalOpen(true)
  }
  const openEditModal = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleSubmitTask = async (values) => {
    if (editingTask) {
      await updateTask(editingTask.id, values)
    } else {
      await createTask(values)
    }
    setModalOpen(false)
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('¿Eliminar esta tarea para todos los usuarios? Esta acción no se puede deshacer.')) {
      await deleteTask(taskId)
    }
  }

  const newTaskButton = isAdmin && (
    <button
      onClick={openCreateModal}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
    >
      + Nueva tarea
    </button>
  )

  const pendientes = myTasks.filter((t) => t.myStatus === 'pendiente')
  const completadas = myTasks.filter((t) => t.myStatus === 'completada')

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:pl-0">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Topbar title="Panel" onMenuClick={() => setSidebarOpen(true)} action={newTaskButton} />
                <main className="px-4 py-6 md:px-8">
                  {loading ? <FullScreenSpinner inline /> : <Dashboard stats={stats} />}
                </main>
              </>
            }
          />
          <Route
            path="/tareas"
            element={
              <TaskPage
                title="Todas las tareas"
                tasks={myTasks}
                loading={loading}
                isAdmin={isAdmin}
                action={newTaskButton}
                onMenuClick={() => setSidebarOpen(true)}
                onToggle={toggleTaskStatus}
                onHide={hideFromMyView}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                emptyMessage="Aún no hay tareas creadas para el equipo."
              />
            }
          />
          <Route
            path="/pendientes"
            element={
              <TaskPage
                title="Pendientes"
                tasks={pendientes}
                loading={loading}
                isAdmin={isAdmin}
                onMenuClick={() => setSidebarOpen(true)}
                onToggle={toggleTaskStatus}
                onHide={hideFromMyView}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                emptyMessage="No te quedan tareas pendientes. ✨"
              />
            }
          />
          <Route
            path="/completadas"
            element={
              <TaskPage
                title="Completadas"
                tasks={completadas}
                loading={loading}
                isAdmin={isAdmin}
                onMenuClick={() => setSidebarOpen(true)}
                onToggle={toggleTaskStatus}
                onHide={hideFromMyView}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                emptyMessage="Todavía no has completado ninguna tarea."
              />
            }
          />
          <Route
            path="/perfil"
            element={
              <>
                <Topbar title="Mi perfil" onMenuClick={() => setSidebarOpen(true)} />
                <main className="px-4 py-6 md:px-8">
                  <ProfilePage stats={stats} />
                </main>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTask}
        initialTask={editingTask}
      />
    </div>
  )
}

function TaskPage({ title, tasks, loading, isAdmin, action, onMenuClick, onToggle, onHide, onEdit, onDelete, emptyMessage }) {
  return (
    <>
      <Topbar title={title} onMenuClick={onMenuClick} action={action} />
      <main className="px-4 py-6 md:px-8">
        {loading ? (
          <FullScreenSpinner inline />
        ) : (
          <TaskList
            tasks={tasks}
            isAdmin={isAdmin}
            onToggle={onToggle}
            onHide={onHide}
            onEdit={onEdit}
            onDelete={onDelete}
            emptyMessage={emptyMessage}
          />
        )}
      </main>
    </>
  )
}

function FullScreenSpinner({ inline }) {
  const wrapper = inline ? 'py-16' : 'min-h-screen'
  return (
    <div className={`grid place-items-center ${wrapper}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
    </div>
  )
}
