import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const DEFAULT_DB = {
  users: [],      // { id, username, password(hash), role, createdAt }
  profiles: [],   // { id, userId, name, avatar, createdAt }
  libraries: [],  // { id, name, path, type, createdAt }
  media: [],      // { id, libraryId, type:'movie'|'show', title, year, addedAt, path?, size?, episodes?[] }
  progress: [],   // { id, profileId, playableId, parentId, position, duration, finished, updatedAt }
}

let db = null

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2))
}

export function loadDb() {
  if (db) return db
  ensure()
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'))
  } catch {
    db = JSON.parse(JSON.stringify(DEFAULT_DB))
  }
  for (const key of Object.keys(DEFAULT_DB)) {
    if (!Array.isArray(db[key])) db[key] = []
  }
  return db
}

export function saveDb() {
  if (!db) return
  ensure()
  // Scrittura atomica: scrive su file temporaneo e poi rinomina, così un'interruzione
  // del processo non lascia un db.json corrotto/troncato.
  const tmp = DB_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DB_FILE)
}
