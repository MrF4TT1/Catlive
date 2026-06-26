import { Router } from 'express'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth, requireAdmin } from '../auth.js'
import { scanLibrary } from '../scanner.js'
import { deleteFile } from '../storage.js'

const r = Router()
r.use(requireAuth)

// La scansione di cartelle locali è una funzione da self-host: in cloud è una
// lettura di file arbitrari del server, quindi è disattivata salvo opt-in esplicito.
const allowLocalScan = process.env.ALLOW_LOCAL_SCAN === 'true'

// Nella demo pubblica le librerie sono di sola lettura: niente aggiunta/scansione
// di percorsi del server da parte di visitatori anonimi.
function blockedInDemo(req, res) {
  if (process.env.DEMO_MODE === 'true') {
    res.status(403).json({ error: 'Azione non disponibile nella demo pubblica' })
    return true
  }
  return false
}

function withCount(db, lib) {
  return { ...lib, count: db.media.filter((m) => m.libraryId === lib.id).length }
}

r.get('/', (req, res) => {
  const db = loadDb()
  res.json(db.libraries.map((l) => withCount(db, l)))
})

r.post('/', requireAdmin, (req, res) => {
  if (blockedInDemo(req, res)) return
  const db = loadDb()
  const { name, path: dir, type } = req.body || {}
  if (!name) return res.status(400).json({ error: 'Il nome è obbligatorio' })

  const CATEGORIES = ['film', 'serie', 'anime', 'altro']
  const category = CATEGORIES.includes(req.body.category) ? req.body.category : 'altro'
  const lib = {
    id: randomUUID(),
    name: String(name).trim(),
    type: type === 'movie' ? 'movie' : type === 'show' ? 'show' : 'mixed',
    category,
    createdAt: Date.now(),
  }

  // Con percorso → scansiona una cartella locale (solo self-host con opt-in).
  // Senza percorso → libreria vuota da riempire via upload (modalità cloud).
  if (dir) {
    if (!allowLocalScan) {
      return res.status(403).json({ error: 'Scansione cartelle locali disattivata (imposta ALLOW_LOCAL_SCAN=true solo in self-host)' })
    }
    if (!fs.existsSync(dir)) return res.status(400).json({ error: 'Il percorso non esiste sul server' })
    if (!fs.statSync(dir).isDirectory()) return res.status(400).json({ error: 'Il percorso non è una cartella' })
    lib.path = dir
    db.libraries.push(lib)
    const items = scanLibrary(lib)
    db.media = db.media.filter((m) => m.libraryId !== lib.id).concat(items)
  } else {
    db.libraries.push(lib)
  }

  saveDb()
  res.json(withCount(db, lib))
})

r.post('/:id/scan', requireAdmin, (req, res) => {
  if (blockedInDemo(req, res)) return
  if (!allowLocalScan) return res.status(403).json({ error: 'Scansione cartelle locali disattivata' })
  const db = loadDb()
  const lib = db.libraries.find((l) => l.id === req.params.id)
  if (!lib) return res.status(404).json({ error: 'Libreria non trovata' })
  const items = scanLibrary(lib)
  db.media = db.media.filter((m) => m.libraryId !== lib.id).concat(items)
  saveDb()
  res.json(withCount(db, lib))
})

r.delete('/:id', requireAdmin, (req, res) => {
  if (blockedInDemo(req, res)) return
  const db = loadDb()
  const idx = db.libraries.findIndex((l) => l.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Libreria non trovata' })
  const [lib] = db.libraries.splice(idx, 1)

  // Rimuovi anche i file caricati (R2/disco) collegati a questa libreria.
  const removed = db.media.filter((m) => m.libraryId === lib.id)
  for (const m of removed) {
    if (m.storageKey) deleteFile(m.storageKey)
    if (m.episodes) for (const e of m.episodes) if (e.storageKey) deleteFile(e.storageKey)
  }
  db.media = db.media.filter((m) => m.libraryId !== lib.id)
  saveDb()
  res.json({ ok: true })
})

export default r
