import { Router } from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { requireAuth, requireAdmin } from '../auth.js'
import { putFile, presignGet, localPath, storageMode } from '../storage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.resolve(__dirname, '..', '..', 'data', 'tmp')
fs.mkdirSync(TMP_DIR, { recursive: true })

const IMG = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, TMP_DIR),
    filename: (req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname)),
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, !!IMG[path.extname(file.originalname).toLowerCase()]),
})

const r = Router()

function findMedia(db, id) {
  return db.media.find((m) => m.id === id)
}

// GET /api/cover/:id → immagine di copertina (R2 con redirect firmato, o disco locale)
r.get('/:id', requireAuth, async (req, res) => {
  const db = loadDb()
  const m = findMedia(db, req.params.id)
  if (!m || !m.posterKey) return res.status(404).end()
  if (storageMode() === 'r2') {
    try {
      return res.redirect(302, await presignGet(m.posterKey))
    } catch {
      return res.status(502).end()
    }
  }
  const file = localPath(m.posterKey)
  if (!fs.existsSync(file)) return res.status(404).end()
  const type = IMG[path.extname(file).toLowerCase()] || 'application/octet-stream'
  res.setHeader('Content-Type', type)
  res.setHeader('Cache-Control', 'private, max-age=3600')
  fs.createReadStream(file).pipe(res)
})

// POST /api/cover  (multipart: campo "file" + "mediaId")
r.post('/', requireAuth, requireAdmin, upload.single('file'), async (req, res) => {
  if (process.env.DEMO_MODE === 'true') {
    if (req.file) fs.unlink(req.file.path, () => {})
    return res.status(403).json({ error: 'Non disponibile nella demo' })
  }
  const file = req.file
  if (!file) return res.status(400).json({ error: 'Immagine non valida (jpg, png, webp)' })
  const db = loadDb()
  const m = findMedia(db, req.body.mediaId)
  if (!m) {
    fs.unlink(file.path, () => {})
    return res.status(404).json({ error: 'Contenuto non trovato' })
  }
  const key = `covers/${m.id}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`
  try {
    await putFile(key, file.path, file.mimetype)
  } catch (e) {
    fs.unlink(file.path, () => {})
    return res.status(500).json({ error: 'Errore salvataggio copertina: ' + (e.message || '') })
  }
  m.posterKey = key
  await saveDb()
  res.json({ ok: true })
})

r.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Immagine troppo grande (max 12 MB)' })
  }
  if (err) return res.status(500).json({ error: 'Errore caricamento copertina' })
  next()
})

export default r
