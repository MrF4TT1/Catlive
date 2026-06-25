import { Router } from 'express'
import fs from 'fs'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth } from '../auth.js'
import { scanLibrary } from '../scanner.js'

const r = Router()
r.use(requireAuth)

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

r.post('/', (req, res) => {
  if (blockedInDemo(req, res)) return
  const db = loadDb()
  const { name, path: dir, type } = req.body || {}
  if (!name || !dir) return res.status(400).json({ error: 'Nome e percorso sono obbligatori' })
  if (!fs.existsSync(dir)) return res.status(400).json({ error: 'Il percorso non esiste sul server' })
  if (!fs.statSync(dir).isDirectory()) return res.status(400).json({ error: 'Il percorso non è una cartella' })

  const lib = {
    id: randomUUID(),
    name: String(name).trim(),
    path: dir,
    type: type === 'movie' ? 'movie' : type === 'show' ? 'show' : 'mixed',
    createdAt: Date.now(),
  }
  db.libraries.push(lib)

  const items = scanLibrary(lib)
  db.media = db.media.filter((m) => m.libraryId !== lib.id).concat(items)
  saveDb()
  res.json(withCount(db, lib))
})

r.post('/:id/scan', (req, res) => {
  if (blockedInDemo(req, res)) return
  const db = loadDb()
  const lib = db.libraries.find((l) => l.id === req.params.id)
  if (!lib) return res.status(404).json({ error: 'Libreria non trovata' })
  const items = scanLibrary(lib)
  db.media = db.media.filter((m) => m.libraryId !== lib.id).concat(items)
  saveDb()
  res.json(withCount(db, lib))
})

r.delete('/:id', (req, res) => {
  if (blockedInDemo(req, res)) return
  const db = loadDb()
  const idx = db.libraries.findIndex((l) => l.id === req.params.id)
  if (idx < 0) return res.status(404).json({ error: 'Libreria non trovata' })
  const [lib] = db.libraries.splice(idx, 1)
  db.media = db.media.filter((m) => m.libraryId !== lib.id)
  saveDb()
  res.json({ ok: true })
})

export default r
