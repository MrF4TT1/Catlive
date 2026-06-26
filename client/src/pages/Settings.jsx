import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from '../components/Icon.jsx'
import { CATEGORIES, catLabel, catIcon } from '../lib/categories.js'

function uploadFile(file, libraryId, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.withCredentials = true
    xhr.timeout = 1000 * 60 * 30
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        onProgress(pct, pct >= 100 ? 'finalize' : 'upload')
      }
    }
    xhr.onload = () => {
      let data = {}
      try { data = JSON.parse(xhr.responseText) } catch { /* */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else if (xhr.status === 413) reject(new Error(data.error || 'File troppo grande'))
      else if (xhr.status === 502 || xhr.status === 504) reject(new Error('Il server non ha confermato il salvataggio (file forse troppo grande per il piano gratuito)'))
      else reject(new Error(data.error || `Errore (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Errore di rete o file troppo grande'))
    xhr.upload.onerror = () => reject(new Error('Errore di rete durante il caricamento'))
    xhr.ontimeout = () => reject(new Error('Tempo scaduto: file forse troppo grande'))
    const form = new FormData()
    form.append('libraryId', libraryId)
    form.append('file', file)
    xhr.send(form)
  })
}

export default function Settings() {
  const { demo, maxUploadMb } = useAuth()
  const [libs, setLibs] = useState([])
  const [form, setForm] = useState({ name: '', type: 'mixed', category: 'serie', path: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploads, setUploads] = useState({})
  const fileInputs = useRef({})

  const load = () => api.get('/libraries').then(setLibs).catch(() => {})
  useEffect(() => { load() }, [])

  const addLibrary = async (e) => {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      const payload = { name: form.name, type: form.type, category: form.category }
      if (form.path.trim()) payload.path = form.path.trim()
      const lib = await api.post('/libraries', payload)
      setForm({ name: '', type: 'mixed', category: 'serie', path: '' })
      setMsg(`Libreria "${lib.name}" creata.` + (lib.count ? ` ${lib.count} elementi.` : ' Ora carica i tuoi file.'))
      load()
    } catch (err) { setMsg(err.message) } finally { setBusy(false) }
  }

  const onFilesPicked = async (libId, fileList) => {
    const files = Array.from(fileList); let ok = 0; const errors = []
    for (const file of files) {
      if (file.size > maxUploadMb * 1024 * 1024) { errors.push(`${file.name}: supera ${maxUploadMb} MB`); continue }
      setUploads((u) => ({ ...u, [libId]: { name: file.name, percent: 0, phase: 'upload' } }))
      try {
        await uploadFile(file, libId, (percent, phase) => setUploads((u) => ({ ...u, [libId]: { name: file.name, percent, phase } })))
        ok++
      } catch (err) { errors.push(`${file.name}: ${err.message}`) }
    }
    setUploads((u) => { const c = { ...u }; delete c[libId]; return c })
    setMsg(errors.length ? `Completato: ${ok} caricati, ${errors.length} falliti. ${errors.join(' · ')}` : `Completato: ${ok} file caricati.`)
    load()
  }

  const scan = async (id) => {
    setMsg('Scansione…')
    try { const lib = await api.post(`/libraries/${id}/scan`); setMsg(`Scansione completata: ${lib.count} elementi.`); load() } catch (e) { setMsg(e.message) }
  }
  const remove = async (id) => {
    if (!confirm('Eliminare questa libreria e i file caricati?')) return
    await api.del('/libraries/' + id); load()
  }

  const input = 'w-full bg-ink-800/70 rounded-xl px-3 py-2.5 outline-none border border-brand-500/20 focus:border-brand-500 focus:shadow-neon-sm transition'

  return (
    <div className="max-w-2xl animate-fadeup">
      <h1 className="font-display text-2xl md:text-3xl font-black mb-6 neon-text">Le mie librerie</h1>

      {demo && (
        <div className="mb-6 rounded-2xl glass p-4 text-sm text-brand-100/80">
          Sei nella <span className="font-semibold text-neon-pink">demo pubblica</span>: librerie in sola lettura.
        </div>
      )}

      <form onSubmit={addLibrary} className="glass rounded-2xl p-5 mb-6 space-y-3">
        <div className="font-display font-bold flex items-center gap-2"><Icon name="plus" size={18} className="text-brand-400" /> Crea una libreria</div>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome (es. I miei anime)" className={input} />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={input}>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={input}>
            <option value="mixed">Rileva automaticamente</option>
            <option value="movie">Film singoli</option>
            <option value="show">Serie a episodi</option>
          </select>
        </div>

        <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-xs text-brand-200/50 hover:text-white transition">
          {showAdvanced ? '− Nascondi avanzate' : '+ Opzioni avanzate (self-host)'}
        </button>
        {showAdvanced && (
          <input value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} placeholder="Percorso locale (solo self-host con ALLOW_LOCAL_SCAN=true)" className={`${input} font-mono text-sm`} />
        )}

        <button disabled={busy} className="btn-neon disabled:opacity-50">
          {busy ? 'Creazione…' : 'Crea libreria'}
        </button>
      </form>

      {msg && <p className="text-sm text-brand-300 mb-4">{msg}</p>}
      {!demo && <p className="text-xs text-brand-200/40 mb-3">Caricamento: max {maxUploadMb} MB per file.</p>}

      <div className="space-y-3">
        {libs.map((l) => (
          <div key={l.id} className="glass rounded-2xl px-4 py-3.5 hover:shadow-neon-sm transition">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-300 bg-brand-500/10 ring-1 ring-brand-500/20">
                <Icon name={catIcon(l.category)} size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{l.name}</div>
                <div className="text-xs text-brand-200/50">{catLabel(l.category)}{l.path ? ` · ${l.path}` : ''}</div>
              </div>
              <span className="text-sm text-brand-200/50 whitespace-nowrap">{l.count} elementi</span>
              {!demo && (
                <>
                  <input type="file" multiple accept="video/*,.mkv,.avi" className="hidden" ref={(el) => (fileInputs.current[l.id] = el)} onChange={(e) => onFilesPicked(l.id, e.target.files)} />
                  <button onClick={() => fileInputs.current[l.id]?.click()} className="btn-neon text-sm px-3 py-1.5">
                    <Icon name="upload" size={16} /> Carica
                  </button>
                  {l.path && <button onClick={() => scan(l.id)} className="btn-ghost text-sm px-3 py-1.5">Scansiona</button>}
                  <button onClick={() => remove(l.id)} className="text-brand-200/40 hover:text-neon-pink transition" title="Elimina"><Icon name="trash" size={18} /></button>
                </>
              )}
            </div>
            {uploads[l.id] && (
              <div className="mt-3">
                <div className="text-xs text-brand-200/60 mb-1 truncate">
                  {uploads[l.id].phase === 'finalize' ? `Finalizzazione (salvataggio)… ${uploads[l.id].name}` : `Caricamento: ${uploads[l.id].name} — ${uploads[l.id].percent}%`}
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${uploads[l.id].phase === 'finalize' ? 'animate-pulse' : ''}`} style={{ width: `${uploads[l.id].percent}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                </div>
              </div>
            )}
          </div>
        ))}
        {libs.length === 0 && <p className="text-brand-200/50">Nessuna libreria. Creane una qui sopra.</p>}
      </div>
    </div>
  )
}
