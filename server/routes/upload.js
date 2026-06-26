import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth, requireAdmin } from '../auth.js'
import { putFile } from '../storage.js'
import { parseFile, parseEpisodeNumber, clean, idFor } from '../scanner.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.resolve(__dirname, '..', '..', 'data', 'tmp')
fs.mkdirSync(TMP_DIR, { recursive: true })

const VIDEO_EXT = new Set(['.mp4', '.m4v', '.webm', '.mkv', '.mov', '.avi', '.mpg', '.mpeg', '.ts'])

// Limite realistico per il piano gratuito (l'upload passa dal server, che ha tempi/risorse
// limitati). Configurabile con MAX_UPLOAD_MB.
export const MAX_UPLOAD_MB = parseInt(process.env.MAX_UPLOAD_MB || '500', 10)

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, TMP_DIR),
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname)),
  }),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
  // Rifiuta i formati non video PRIMA di scriverli su disco.
  fileFilter: (req, file, cb) => cb(null, VIDEO_EXT.has(path.extname(file.originalname).toLowerCase())),
})

const r = Router()
r.use(requireAuth)

// POST /api/upload  (multipart: campo "file" + "libraryId")
r.post('/', requireAdmin, upload.single('file'), async (req, res) => {
  if (process.env.DEMO_MODE === 'true') {
    if (req.file) fs.unlink(req.file.path, () => {})
    return res.status(403).json({ error: 'Upload non disponibile nella demo pubblica' })
  }
  const file = req.file
  if (!file) return res.status(400).json({ error: 'Nessun file video valido (formati: mp4, mkv, webm, mov, ...)' })

  const db = loadDb()
  const lib = db.libraries.find((l) => l.id === req.body.libraryId)
  if (!lib) {
    fs.unlink(file.path, () => {})
    return res.status(404).json({ error: 'Libreria non trovata' })
  }

  const ext = path.extname(file.originalname).toLowerCase()
  const key = `${lib.id}/${randomUUID()}${ext}`
  try {
    await putFile(key, file.path, file.mimetype)
  } catch (e) {
    fs.unlink(file.path, () => {})
    console.error('[CatAlive] Upload storage error:', e)
    return res.status(500).json({ error: 'Errore salvataggio file: ' + (e.message || 'sconosciuto') })
  }

  // Categoria/tipo della libreria decidono come catalogare.
  const isSeries = lib.type === 'show' || lib.category === 'serie' || lib.category === 'anime'
  const isMovie = lib.type === 'movie' || lib.category === 'film'

  let result
  if (isSeries) {
    // Una libreria Serie/Anime = UNA serie sola: tutti i file diventano episodi.
    const showId = idFor(lib.id + '|show')
    let show = db.media.find((m) => m.type === 'show' && m.id === showId)
    if (!show) {
      show = { id: showId, libraryId: lib.id, type: 'show', title: lib.name, episodes: [], addedAt: Date.now() }
      db.media.push(show)
    }
    const pe = parseEpisodeNumber(file.originalname)
    const season = pe?.season || 1
    const episode = pe?.episode || show.episodes.length + 1
    let title = clean(file.originalname)
    if (!title || /^\d{1,3}$/.test(title)) title = `Episodio ${episode}`
    show.episodes.push({ id: idFor(key), season, episode, title, storageKey: key, size: file.size })
    show.episodes.sort((a, b) => a.season - b.season || a.episode - b.episode)
    result = show
  } else if (isMovie) {
    const parsed = parseFile(file.originalname, 'movie')
    const item = { id: idFor(key), libraryId: lib.id, type: 'movie', title: parsed.title, year: parsed.year, storageKey: key, size: file.size, addedAt: Date.now() }
    db.media.push(item)
    result = item
  } else {
    // Misto: rilevamento automatico (film oppure episodio raggruppato per titolo).
    const parsed = parseFile(file.originalname, lib.type)
    if (parsed.kind === 'movie') {
      const item = { id: idFor(key), libraryId: lib.id, type: 'movie', title: parsed.title, year: parsed.year, storageKey: key, size: file.size, addedAt: Date.now() }
      db.media.push(item)
      result = item
    } else {
      const showId = idFor(lib.id + '|' + parsed.showTitle.toLowerCase())
      let show = db.media.find((m) => m.type === 'show' && m.id === showId)
      if (!show) {
        show = { id: showId, libraryId: lib.id, type: 'show', title: parsed.showTitle, year: parsed.year, episodes: [], addedAt: Date.now() }
        db.media.push(show)
      }
      show.episodes.push({ id: idFor(key), season: parsed.season, episode: parsed.episode, title: parsed.title, storageKey: key, size: file.size })
      show.episodes.sort((a, b) => a.season - b.season || a.episode - b.episode)
      result = show
    }
  }

  // Attende la persistenza PRIMA di rispondere: evita metadati persi (file orfano su R2)
  // se il processo viene terminato subito dopo (spin-down/redeploy Render).
  await saveDb()
  res.json({ ok: true, title: result.title, type: result.type })
})

// Gestione errori specifica dell'upload (es. file troppo grande → 413).
r.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `File troppo grande: massimo ${MAX_UPLOAD_MB} MB su questo piano.` })
    }
    return res.status(400).json({ error: 'Upload non valido: ' + err.message })
  }
  if (err) {
    console.error('[CatAlive] Upload error:', err.message)
    return res.status(500).json({ error: 'Errore durante il caricamento' })
  }
  next()
})

export default r
