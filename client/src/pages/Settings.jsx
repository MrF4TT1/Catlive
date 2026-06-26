import { useEffect, useRef, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

// Upload con barra di avanzamento (XHR per avere il progresso, che fetch non offre).
// onProgress riceve (percent, phase) dove phase è 'upload' o 'finalize'.
function uploadFile(file, libraryId, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.withCredentials = true
    xhr.timeout = 1000 * 60 * 30 // 30 min
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
      else if (xhr.status === 413) reject(new Error(data.error || 'File troppo grande per questo piano'))
      else if (xhr.status === 502 || xhr.status === 504) reject(new Error('Il server non ha confermato il salvataggio (file forse troppo grande/lento per il piano gratuito)'))
      else reject(new Error(data.error || `Errore (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Errore di rete o file troppo grande per il piano gratuito'))
    xhr.upload.onerror = () => reject(new Error('Errore di rete durante il caricamento'))
    xhr.ontimeout = () => reject(new Error('Tempo scaduto: il file potrebbe essere troppo grande'))
    const form = new FormData()
    form.append('libraryId', libraryId)
    form.append('file', file)
    xhr.send(form)
  })
}

export default function Settings() {
  const { demo, maxUploadMb } = useAuth()
  const [libs, setLibs] = useState([])
  const [form, setForm] = useState({ name: '', type: 'mixed', path: '' })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploads, setUploads] = useState({}) // { libraryId: { name, percent, phase } }
  const fileInputs = useRef({})

  const load = () => api.get('/libraries').then(setLibs).catch(() => {})
  useEffect(() => { load() }, [])

  const addLibrary = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const payload = { name: form.name, type: form.type }
      if (form.path.trim()) payload.path = form.path.trim()
      const lib = await api.post('/libraries', payload)
      setForm({ name: '', type: 'mixed', path: '' })
      setMsg(`Libreria "${lib.name}" creata.` + (lib.count ? ` ${lib.count} elementi trovati.` : ' Ora carica i tuoi file.'))
      load()
    } catch (err) {
      setMsg(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onFilesPicked = async (libId, fileList) => {
    const files = Array.from(fileList)
    let ok = 0
    const errors = []
    for (const file of files) {
      if (file.size > maxUploadMb * 1024 * 1024) {
        errors.push(`${file.name}: supera ${maxUploadMb} MB`)
        continue
      }
      setUploads((u) => ({ ...u, [libId]: { name: file.name, percent: 0, phase: 'upload' } }))
      try {
        await uploadFile(file, libId, (percent, phase) =>
          setUploads((u) => ({ ...u, [libId]: { name: file.name, percent, phase } }))
        )
        ok++
      } catch (err) {
        errors.push(`${file.name}: ${err.message}`)
      }
    }
    setUploads((u) => { const c = { ...u }; delete c[libId]; return c })
    setMsg(
      errors.length
        ? `Completato: ${ok} caricati, ${errors.length} falliti. ${errors.join(' · ')}`
        : `Completato: ${ok} file caricati.`
    )
    load()
  }

  const scan = async (id) => {
    setMsg('Scansione in corso…')
    try {
      const lib = await api.post(`/libraries/${id}/scan`)
      setMsg(`Scansione completata: ${lib.count} elementi.`)
      load()
    } catch (e) { setMsg(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Eliminare questa libreria e i file caricati?')) return
    await api.del('/libraries/' + id)
    load()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Le mie librerie</h1>

      {demo && (
        <div className="mb-6 rounded-lg bg-brand-600/15 ring-1 ring-brand-500/30 p-4 text-sm text-zinc-300">
          Sei nella <span className="font-semibold text-brand-300">demo pubblica</span>: librerie in sola lettura.
        </div>
      )}

      <form onSubmit={addLibrary} className="bg-white/5 rounded-lg p-4 mb-6 space-y-3 ring-1 ring-white/10">
        <div className="font-semibold">Crea una libreria</div>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nome (es. Film, Le mie serie)"
          className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-white/10 rounded px-3 py-2 outline-none"
        >
          <option value="mixed">Misto (rileva automaticamente)</option>
          <option value="movie">Film</option>
          <option value="show">Serie TV</option>
        </select>

        <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-xs text-zinc-400 hover:text-white">
          {showAdvanced ? '− Nascondi opzioni avanzate' : '+ Opzioni avanzate (self-host)'}
        </button>
        {showAdvanced && (
          <input
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            placeholder="Percorso cartella locale (solo self-host con ALLOW_LOCAL_SCAN=true)"
            className="w-full bg-white/10 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
          />
        )}

        <button disabled={busy} className="bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded font-semibold disabled:opacity-50">
          {busy ? 'Creazione…' : 'Crea libreria'}
        </button>
      </form>

      {msg && <p className="text-sm text-brand-400 mb-4">{msg}</p>}

      {!demo && (
        <p className="text-xs text-zinc-500 mb-2">Caricamento: max {maxUploadMb} MB per file (piano gratuito).</p>
      )}

      <div className="space-y-2">
        {libs.map((l) => (
          <div key={l.id} className="bg-white/5 rounded-lg px-4 py-3 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{l.name}</div>
                <div className="text-xs text-zinc-400">
                  {l.type === 'movie' ? 'Film' : l.type === 'show' ? 'Serie TV' : 'Misto'}
                  {l.path ? ` · ${l.path}` : ''}
                </div>
              </div>
              <span className="text-sm text-zinc-400 whitespace-nowrap">{l.count} elementi</span>
              {!demo && (
                <>
                  <input
                    type="file"
                    multiple
                    accept="video/*,.mkv,.avi"
                    className="hidden"
                    ref={(el) => (fileInputs.current[l.id] = el)}
                    onChange={(e) => onFilesPicked(l.id, e.target.files)}
                  />
                  <button
                    onClick={() => fileInputs.current[l.id]?.click()}
                    className="text-sm bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded font-semibold"
                  >
                    ＋ Carica file
                  </button>
                  {l.path && (
                    <button onClick={() => scan(l.id)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">
                      Ri-scansiona
                    </button>
                  )}
                  <button onClick={() => remove(l.id)} className="text-sm text-red-400 hover:text-red-300">Elimina</button>
                </>
              )}
            </div>
            {uploads[l.id] && (
              <div className="mt-3">
                <div className="text-xs text-zinc-400 mb-1 truncate">
                  {uploads[l.id].phase === 'finalize'
                    ? `Finalizzazione (salvataggio)… ${uploads[l.id].name}`
                    : `Caricamento: ${uploads[l.id].name} — ${uploads[l.id].percent}%`}
                </div>
                <div className="h-1.5 bg-white/10 rounded overflow-hidden">
                  <div
                    className={`h-full rounded transition-all ${uploads[l.id].phase === 'finalize' ? 'bg-brand-400 animate-pulse' : 'bg-brand-500'}`}
                    style={{ width: `${uploads[l.id].percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        {libs.length === 0 && <p className="text-zinc-500">Nessuna libreria. Creane una qui sopra e carica i tuoi file.</p>}
      </div>
    </div>
  )
}
