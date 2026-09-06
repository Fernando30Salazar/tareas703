import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    const { error } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password, fullName)
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    if (mode === 'signup') {
      setNotice('Cuenta creada. Revisa tu correo para confirmar el acceso, luego inicia sesión.')
      setMode('signin')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-card bg-ink" />
          <h1 className="font-display text-2xl font-semibold text-ink">Tareas del equipo</h1>
          <p className="mt-1 text-sm text-muted">Mismas tareas, progreso de cada quien.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-line bg-surface p-6">
          <div className="mb-4 flex rounded-lg bg-canvas p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                mode === 'signin' ? 'bg-surface shadow-sm text-ink' : 'text-muted'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
                mode === 'signup' ? 'bg-surface shadow-sm text-ink' : 'text-muted'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {mode === 'signup' && (
            <label className="mb-3 block text-sm">
              <span className="mb-1 block font-medium text-ink">Nombre</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Tu nombre"
              />
            </label>
          )}

          <label className="mb-3 block text-sm">
            <span className="mb-1 block font-medium text-ink">Correo</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="tu@equipo.com"
            />
          </label>

          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-medium text-ink">Contraseña</span>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="mb-3 text-sm text-priority-alta">{error}</p>}
          {notice && <p className="mb-3 text-sm text-accent-dark">{notice}</p>}

          <button
            disabled={busy}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
