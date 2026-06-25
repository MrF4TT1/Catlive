import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loadDb } from './store.js'

export const COOKIE = 'cat_token'

// In produzione il segreto è OBBLIGATORIO: niente fallback debole pubblicamente noto
// (altrimenti chiunque potrebbe forgiare token validi). In sviluppo si usa un segreto locale.
const isProd = process.env.NODE_ENV === 'production'
if (isProd && !process.env.JWT_SECRET) {
  throw new Error('[CatAlive] JWT_SECRET è obbligatorio in produzione (NODE_ENV=production). Imposta la variabile d\'ambiente.')
}
if (!process.env.JWT_SECRET) {
  console.warn('[CatAlive] JWT_SECRET non impostato: uso un segreto di sviluppo (solo per uso locale).')
}
const SECRET = process.env.JWT_SECRET || 'catalive-dev-secret-change-me'

export function hashPassword(pw) {
  return bcrypt.hashSync(String(pw), 10)
}

export function verifyPassword(pw, hash) {
  try {
    return bcrypt.compareSync(String(pw), hash)
  } catch {
    return false
  }
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

export function requireAuth(req, res, next) {
  const bearer = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null
  const token = req.cookies?.[COOKIE] || bearer
  const data = token ? verifyToken(token) : null
  if (!data) return res.status(401).json({ error: 'Non autenticato' })

  const db = loadDb()
  const user = db.users.find((u) => u.id === data.uid)
  if (!user) return res.status(401).json({ error: 'Utente non valido' })

  req.user = user
  next()
}
