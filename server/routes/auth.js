import { Router } from 'express'
import { randomUUID } from 'crypto'
import { loadDb, saveDb } from '../store.js'
import { hashPassword, verifyPassword, signToken, requireAuth, COOKIE } from '../auth.js'

const r = Router()
const AVATARS = ['🐱', '🦁', '🐯', '🐰', '🐼', '🦊', '🐶', '🐸']

function setCookie(req, res, token) {
  // "secure" deciso dal protocollo reale della richiesta (con trust proxy dietro HTTPS):
  // così il cookie funziona sia su Render/HTTPS sia in self-host su HTTP.
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https'
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 30 * 24 * 3600 * 1000,
  })
}

function publicUser(u) {
  return { id: u.id, username: u.username, role: u.role }
}

// Rate limiter in-memory, per-IP, sulle rotte di autenticazione (anti brute-force).
const attempts = new Map()
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  const max = 20
  let rec = attempts.get(ip)
  if (!rec || now > rec.reset) rec = { count: 0, reset: now + windowMs }
  rec.count++
  attempts.set(ip, rec)
  if (rec.count > max) {
    return res.status(429).json({ error: 'Troppi tentativi. Riprova tra qualche minuto.' })
  }
  next()
}

// Indica se serve la configurazione iniziale (nessun utente).
r.get('/status', (req, res) => {
  const db = loadDb()
  const demo = process.env.DEMO_MODE === 'true'
  res.json({
    needsSetup: db.users.length === 0,
    demo,
    maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '500', 10),
    ...(demo ? { demoCreds: { username: 'demo', password: 'demo' } } : {}),
  })
})

// Crea il primo account amministratore.
r.post('/setup', rateLimit, (req, res) => {
  if (process.env.DEMO_MODE === 'true') {
    return res.status(403).json({ error: 'Registrazione non disponibile nella demo pubblica' })
  }
  const db = loadDb()
  if (db.users.length > 0) return res.status(400).json({ error: 'Configurazione già completata' })

  const { username, password, profileName } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Username e password sono obbligatori' })

  const user = {
    id: randomUUID(),
    username: String(username).trim(),
    password: hashPassword(password),
    role: 'admin',
    createdAt: Date.now(),
  }
  db.users.push(user)

  const profile = {
    id: randomUUID(),
    userId: user.id,
    name: String(profileName || username).trim(),
    avatar: AVATARS[0],
    createdAt: Date.now(),
  }
  db.profiles.push(profile)
  saveDb()

  setCookie(req, res, signToken({ uid: user.id }))
  res.json({ user: publicUser(user), profiles: [profile] })
})

r.post('/login', rateLimit, (req, res) => {
  const db = loadDb()
  const { username, password } = req.body || {}
  const user = db.users.find(
    (u) => u.username.toLowerCase() === String(username || '').trim().toLowerCase()
  )
  if (!user || !verifyPassword(password || '', user.password)) {
    return res.status(401).json({ error: 'Credenziali non valide' })
  }
  setCookie(req, res, signToken({ uid: user.id }))
  res.json({ user: publicUser(user), profiles: db.profiles.filter((p) => p.userId === user.id) })
})

r.post('/logout', (req, res) => {
  res.clearCookie(COOKIE)
  res.json({ ok: true })
})

r.get('/me', requireAuth, (req, res) => {
  const db = loadDb()
  res.json({
    user: publicUser(req.user),
    profiles: db.profiles.filter((p) => p.userId === req.user.id),
  })
})

export default r
