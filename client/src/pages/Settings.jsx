import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Settings() {
  const { demo } = useAuth()
  const [libs, setLibs] = useState([])
  const [form, setForm] = useState({ name: '', path: '', type: 'mixed' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => api.get('/libraries').then(setLibs).catch(() => {})
  useEffect(() => {
    load()
  }, [])

  const add = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const lib = await api.post('/libraries', form)
      setForm({ name: '', path: '', type: 'mixed' })
      setMsg(`Libreria "${lib.name}" aggiunta: ${lib.count} elementi trovati.`)
      load()
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  const scan = async (id) => {
    setMsg('Scansione in corso…')
    try {
      const lib = await api.post(`/libraries/${id}/scan`)
      setMsg(`Scansione completata: ${lib.count} elementi.`)
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  const remove = async (id) => {
    if (!confirm('Eliminare questa libreria? I file sul disco non verranno toccati.')) return
    await api.del('/libraries/' + id)
    load()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Librerie</h1>

      {demo && (
        <div className="mb-6 rounded-lg bg-brand-600/15 ring-1 ring-brand-500/30 p-4 text-sm text-zinc-300">
          Sei nella <span className="font-semibold text-brand-300">demo pubblica</span>: le librerie
          sono di sola lettura e mostrano contenuti di esempio. Per usare i tuoi file, esegui CatAlive
          su un tuo server.
        </div>
      )}

      <form onSubmit={add} className="bg-white/5 rounded-lg p-4 mb-6 space-y-3 ring-1 ring-white/10">
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome (es. Film, Serie TV)"
          className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <input
          required
          value={form.path}
          onChange={(e) => setForm({ ...form, path: e.target.value })}
          placeholder="Percorso cartella sul server (es. D:\\Film)"
          className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-white/10 rounded px-3 py-2 outline-none"
        >
          <option value="mixed">Misto (rileva automaticamente)</option>
          <option value="movie">Solo film</option>
          <option value="show">Solo serie TV</option>
        </select>
        <button
          disabled={busy}
          className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded font-semibold disabled:opacity-50"
        >
          {busy ? 'Aggiungo e scansiono…' : 'Aggiungi libreria'}
        </button>
      </form>

      {msg && <p className="text-sm text-brand-400 mb-4">{msg}</p>}

      <div className="space-y-2">
        {libs.map((l) => (
          <div key={l.id} className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 ring-1 ring-white/10">
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{l.name}</div>
              <div className="text-xs text-zinc-400 font-mono truncate">{l.path}</div>
            </div>
            <span className="text-sm text-zinc-400 whitespace-nowrap">{l.count} elementi</span>
            <button onClick={() => scan(l.id)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">
              Ri-scansiona
            </button>
            <button onClick={() => remove(l.id)} className="text-sm text-red-400 hover:text-red-300">
              Elimina
            </button>
          </div>
        ))}
        {libs.length === 0 && <p className="text-zinc-500">Nessuna libreria configurata.</p>}
      </div>
    </div>
  )
}
