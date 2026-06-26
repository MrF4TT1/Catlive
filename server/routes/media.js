import { Router } from 'express'
import { loadDb } from '../store.js'
import { requireAuth } from '../auth.js'

const r = Router()
r.use(requireAuth)

// Versione "pubblica" per la lista/griglia: niente percorsi del filesystem.
function summary(m, catById) {
  const base = {
    id: m.id,
    title: m.title,
    year: m.year,
    libraryId: m.libraryId,
    category: catById[m.libraryId] || 'altro',
    addedAt: m.addedAt,
    hasPoster: !!m.posterKey,
  }
  if (m.type === 'movie') {
    return { ...base, type: 'movie', playableId: m.id }
  }
  const seasons = new Set(m.episodes.map((e) => e.season))
  return { ...base, type: 'show', episodeCount: m.episodes.length, seasonCount: seasons.size }
}

function categoryMap(db) {
  const map = {}
  for (const l of db.libraries) map[l.id] = l.category || 'altro'
  return map
}

r.get('/', (req, res) => {
  const db = loadDb()
  const cat = categoryMap(db)
  const { search, type, library, category } = req.query
  let items = db.media
  if (type) items = items.filter((m) => m.type === type)
  if (library) items = items.filter((m) => m.libraryId === library)
  if (category) items = items.filter((m) => (cat[m.libraryId] || 'altro') === category)
  if (search) {
    const q = String(search).toLowerCase()
    items = items.filter((m) => m.title.toLowerCase().includes(q))
  }
  items = [...items].sort((a, b) => a.title.localeCompare(b.title))
  res.json(items.map((m) => summary(m, cat)))
})

r.get('/home', (req, res) => {
  const db = loadDb()
  const cat = categoryMap(db)
  const libraries = db.libraries.map((l) => ({
    id: l.id,
    name: l.name,
    category: l.category || 'altro',
    type: l.type,
    items: db.media.filter((m) => m.libraryId === l.id).slice(0, 40).map((m) => summary(m, cat)),
  }))
  const recent = [...db.media].sort((a, b) => b.addedAt - a.addedAt).slice(0, 20).map((m) => summary(m, cat))
  res.json({ libraries, recent })
})

r.get('/:id', (req, res) => {
  const db = loadDb()
  const cat = categoryMap(db)
  const m = db.media.find((x) => x.id === req.params.id)
  if (!m) return res.status(404).json({ error: 'Contenuto non trovato' })
  const common = {
    id: m.id,
    title: m.title,
    year: m.year,
    libraryId: m.libraryId,
    category: cat[m.libraryId] || 'altro',
    hasPoster: !!m.posterKey,
  }
  if (m.type === 'movie') {
    return res.json({ ...common, type: 'movie', playableId: m.id })
  }
  res.json({
    ...common,
    type: 'show',
    episodes: m.episodes.map((e) => ({ id: e.id, season: e.season, episode: e.episode, title: e.title })),
  })
})

export default r
