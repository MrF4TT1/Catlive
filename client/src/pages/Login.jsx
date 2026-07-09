import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthShell, Field } from '../components/auth-ui.jsx'
import Icon from '../components/Icon.jsx'

export default function Login() {
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api
      .get('/auth/status')
      .then((s) => {
        if (s.needsSetup) navigate('/setup')
        else setStatus(s)
      })
      .catch(() => {})
  }, [navigate])

  const doLogin = async (creds) => {
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/login', creds)
      await refresh()
      navigate('/')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    doLogin(form)
  }

  return (
    <AuthShell title="🐾 CatAlive" subtitle="Accedi al tuo spazio multimediale">
      {status?.demo && (
        <div className="mb-4 rounded-lg bg-brand-600/20 ring-1 ring-brand-500/40 p-3 text-center">
          <p className="text-sm text-brand-300 font-semibold">Demo pubblica</p>
          <p className="text-xs text-zinc-300 mt-1">
            Catalogo di esempio con film a licenza libera.
          </p>
          <button
            onClick={() => doLogin(status.demoCreds || { username: 'demo', password: 'demo' })}
            disabled={busy}
            className="mt-3 w-full bg-brand-600 hover:bg-brand-500 py-2 rounded font-semibold disabled:opacity-50"
          >
            {busy ? 'Accesso…' : '▶ Entra nella demo'}
          </button>
          <p className="text-[11px] text-zinc-500 mt-2">oppure accedi manualmente con demo / demo</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={busy} className="btn-neon w-full disabled:opacity-50">
          {busy ? 'Accesso…' : 'Accedi'}
        </button>
      </form>

      <Link
        to="/"
        className="mt-5 flex items-center justify-center gap-1.5 text-xs text-brand-200/60 hover:text-white transition-colors"
      >
        <Icon name="back" size={14} /> Torna alla home
      </Link>
    </AuthShell>
  )
}
