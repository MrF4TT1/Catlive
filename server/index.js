import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import profileRoutes from './routes/profiles.js'
import libraryRoutes from './routes/libraries.js'
import mediaRoutes from './routes/media.js'
import streamRoutes from './routes/stream.js'
import progressRoutes from './routes/progress.js'
import { seedDemo } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PORT = process.env.PORT || 4000

const app = express()
// Dietro il proxy/HTTPS dell'host (Render, Fly, ecc.): necessario per i cookie "secure".
app.set('trust proxy', 1)
// In produzione client e server sono lo stesso origin (Express serve la SPA): niente CORS.
// In sviluppo si abilita solo per il dev server Vite.
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
}
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'CatAlive' }))
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/libraries', libraryRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/stream', streamRoutes)
app.use('/api/progress', progressRoutes)

// In produzione: serve la SPA compilata (se presente).
const dist = path.join(ROOT, 'dist')
if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.use((err, req, res, next) => {
  console.error('[CatAlive] Errore:', err)
  res.status(500).json({ error: 'Errore interno del server' })
})

// Precarica i dati demo se richiesto (DEMO_MODE=true).
seedDemo()

app.listen(PORT, () => {
  console.log(`\n🐾 CatAlive server attivo → http://localhost:${PORT}`)
  if (!fs.existsSync(dist)) {
    console.log('   (modalità sviluppo: apri il client Vite su http://localhost:5173)')
  }
})
