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
import uploadRoutes from './routes/upload.js'
import coverRoutes from './routes/cover.js'
import { seedDemo, seedAdminFromEnv } from './seed.js'
import { initStore, flushDb } from './store.js'
import { initStorage } from './storage.js'

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
app.use('/api/upload', uploadRoutes)
app.use('/api/cover', coverRoutes)

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
  const status = err.statusCode || err.status || 500
  if (status >= 500) console.error('[CatAlive] Errore:', err)
  if (status === 400 && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Richiesta JSON non valida' })
  }
  res.status(status).json({ error: status >= 500 ? 'Errore interno del server' : err.message || 'Richiesta non valida' })
})

async function start() {
  await initStore() // DB: Postgres/Neon se DATABASE_URL, altrimenti file locale
  await initStorage() // File: Cloudflare R2 se configurato, altrimenti disco locale

  seedAdminFromEnv() // crea l'admin unico da ADMIN_USERNAME/ADMIN_PASSWORD (se assente)
  seedDemo() // precarica i dati demo se DEMO_MODE=true

  const server = app.listen(PORT, () => {
    console.log(`\n🐾 CatAlive server attivo → http://localhost:${PORT}`)
    if (!fs.existsSync(dist)) {
      console.log('   (modalità sviluppo: apri il client Vite su http://localhost:5173)')
    }
  })

  // Spegnimento ordinato (Render invia SIGTERM): completa le scritture in coda
  // prima di uscire, così non si perdono metadati appena salvati.
  for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => {
      server.close(async () => {
        try { await flushDb() } catch { /* */ }
        process.exit(0)
      })
      setTimeout(() => process.exit(0), 8000).unref()
    })
  }
}

start().catch((e) => {
  console.error('[CatAlive] Avvio fallito:', e)
  process.exit(1)
})
