import { Router } from 'express'
import { loadDb } from '../store.js'
import { requireAuth } from '../auth.js'

const r = Router()
r.use(requireAuth)

// Versione "pubblica" per la lista/griglia: niente percorsi del filesystem.
function summary(m) {
  if (m.type === 'movie') {
    return {
      id: m.id,
      type: 'movie',
      title: m.title,
      year: m.year,
      libraryId: m.libraryId,
      addedAt: m.addedAt,
      playableId: m.id,
    }
  }
  const seasons = new Set(m.episodes.map((e) => e.season))
  return {
    id: m.id,
    type: 'show',
    title: m.title,
    year: m.year,
    libraryId: m.libraryId,
    addedAt: m.addedAt,
    episodeCount: m.episodes.length,
    seasonCount: seasons.size,
  }
}

r.get('/', (req, res) => {
  const db = loadDb()
  const { search, type, library } = req.query
  let items = db.media
  if (type) items = items.filter((m) => m.type === type)
  if (library) items = items.filter((m) => m.libraryId === library)
  if (search) {
    const q = String(search).toLowerCase()
    items = items.filter((m) => m.title.toLowerCase().includes(q))
  }
  items = [...items].sort((a, b) => a.title.localeCompare(b.title))
  res.json(items.map(summary))
})

r.get('/home', (req, res) => {
  const db = loadDb()
  const libraries = db.libraries.map((l) => ({
    id: l.id,
    name: l.name,
    items: db.media.filter((m) => m.libraryId === l.id).slice(0, 30).map(summary),
  }))
  const recent = [...db.media].sort((a, b) => b.addedAt - a.addedAt).slice(0, 20).map(summary)
  res.json({ libraries, recent })
})

r.get('/:id', (req, res) => {
  const db = loadDb()
  const m = db.media.find((x) => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: 'Contenuto non trovato' })
  if (m.type === 'movie') {
    return res.json({ id: m.id, type: 'movie', title: m.title, year: m.year, libraryId: m.libraryId, playableId: m.id })
  }
  res.json({
    id: m.id,
    type: 'show',
    title: m.title,
    year: m.year,
    libraryId: m.libraryId,
    episodes: m.episodes.map((e) => ({ id: e.id, season: e.season, episode: e.episode, title: e.title })),
  })
})

export default r
