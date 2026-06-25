import { Router } from 'express'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth } from '../auth.js'

const r = Router()
r.use(requireAuth)

r.get('/', (req, res) => {
  const db = loadDb()
  res.json(db.profiles.filter((p) => p.userId === req.user.id))
})

r.post('/', (req, res) => {
  const db = loadDb()
  const { name, avatar } = req.body || {}
  if (!name) return res.status(400).json({ error: 'Nome richiesto' })
  const profile = {
    id: randomUUID(),
    userId: req.user.id,
    name: String(name).trim(),
    avatar: avatar || '🐱',
    createdAt: Date.now(),
  }
  db.profiles.push(profile)
  saveDb()
  res.json(profile)
})

r.delete('/:id', (req, res) => {
  const db = loadDb()
  const mine = db.profiles.filter((p) => p.userId === req.user.id)
  if (mine.length <= 1) return res.status(400).json({ error: 'Deve restare almeno un profilo' })
  const idx = db.profiles.findIndex((p) => p.id === req.params.id && p.userId === req.user.id)
  if (idx < 0) return res.status(404).json({ error: 'Profilo non trovato' })
  db.profiles.splice(idx, 1)
  db.progress = db.progress.filter((p) => p.profileId !== req.params.id)
  saveDb()
  res.json({ ok: true })
})

export default r
