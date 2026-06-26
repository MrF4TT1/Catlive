import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { AuthShell, Field } from '../components/auth-ui.jsx'

export default function Setup() {
  const { refresh } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '', profileName: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/setup', form)
      await refresh()
      navigate('/')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <AuthShell title="Benvenuto in CatAlive" subtitle="Crea il tuo account amministratore">
      <form onSubmit={submit} className="space-y-3">
        <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        <Field label="Nome profilo" placeholder="(opzionale)" value={form.profileName} onChange={(v) => setForm({ ...form, profileName: v })} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button disabled={busy} className="btn-neon w-full disabled:opacity-50">
          {busy ? 'Creazione…' : 'Crea account'}
        </button>
      </form>
    </AuthShell>
  )
}
