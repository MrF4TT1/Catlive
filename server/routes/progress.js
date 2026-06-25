import { Router } from 'express'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth } from '../auth.js'

const r = Router()
r.use(requireAuth)

function ownsProfile(db, user, profileId) {
  return db.profiles.some((p) => p.id === profileId && p.userId === user.id)
}

// Tutto lo stato di visione di un profilo (usato dal player per riprendere).
r.get('/', (req, res) => {
  const db = loadDb()
  const { profileId } = req.query
  if (!profileId || !ownsProfile(db, req.user, profileId)) {
    return res.status(400).json({ error: 'Profilo non valido' })
  }
  res.json(db.progress.filter((p) => p.profileId === profileId))
})

// "Continua a guardare": ultimo elemento non finito per ogni film/serie.
r.get('/continue', (req, res) => {
  const db = loadDb()
  const { profileId } = req.query
  if (!profileId || !ownsProfile(db, req.user, profileId)) {
    return res.status(400).json({ error: 'Profilo non valido' })
  }
  const list = db.progress
    .filter((p) => p.profileId === profileId && !p.finished && p.position > 5)
    .sort((a, b) => b.updatedAt - a.updatedAt)

  const seen = new Set()
  const out = []
  for (const p of list) {
    if (seen.has(p.parentId)) continue
    seen.add(p.parentId)
    const media = db.media.find((m) => m.id === p.parentId)
    if (!media) continue
    out.push({ ...p, title: media.title, type: media.type })
  }
  res.json(out.slice(0, 20))
})

// Salva/aggiorna la posizione di visione.
r.post('/', (req, res) => {
  const db = loadDb()
  const { profileId, playableId, parentId, position, duration, finished } = req.body || {}
  if (!profileId || !ownsProfile(db, req.user, profileId)) {
    return res.status(400).json({ error: 'Profilo non valido' })
  }
  if (!playableId) return res.status(400).json({ error: 'playableId richiesto' })

  let rec = db.progress.find((p) => p.profileId === profileId && p.playableId === playableId)
  if (!rec) {
    rec = {
      id: randomUUID(),
      profileId,
      playableId,
      parentId: parentId || playableId,
      position: 0,
      duration: 0,
      finished: false,
    }
    db.progress.push(rec)
  }
  rec.position = Number(position) || 0
  rec.duration = Number(duration) || rec.duration
  rec.parentId = parentId || rec.parentId
  rec.finished = !!finished || (rec.duration > 0 && rec.position / rec.duration > 0.92)
  rec.updatedAt = Date.now()
  saveDb()
  res.json(rec)
})

export default r
