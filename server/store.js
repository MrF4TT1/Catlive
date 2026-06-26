import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const DEFAULT_DB = {
  users: [],      // { id, username, password(hash), role, createdAt }
  profiles: [],   // { id, userId, name, avatar, createdAt }
  libraries: [],  // { id, name, path?, type, demo?, createdAt }
  media: [],      // { id, libraryId, type:'movie'|'show', title, year, addedAt, path?|demoUrl?|storageKey?, episodes?[] }
  progress: [],   // { id, profileId, playableId, parentId, position, duration, finished, updatedAt }
}

let db = null
let backend = 'file'
let pool = null

function emptyDb() {
  return JSON.parse(JSON.stringify(DEFAULT_DB))
}

function normalize(d) {
  d = d || emptyDb()
  for (const key of Object.keys(DEFAULT_DB)) {
    if (!Array.isArray(d[key])) d[key] = []
  }
  return d
}

/**
 * Inizializza lo store. Da chiamare UNA volta all'avvio (prima di servire richieste).
 * - Se è impostata DATABASE_URL → PostgreSQL (Neon), persistente.
 * - Altrimenti → file locale data/db.json (per sviluppo/self-host).
 * I dati dell'app sono piccoli (solo metadati: i video stanno nello storage),
 * quindi sono conservati come un unico documento JSONB.
 */
export async function initStore() {
  if (process.env.DATABASE_URL) {
    const pg = await import('pg')
    const { Pool } = pg.default || pg
    // Verifica il certificato del server per impostazione predefinita (Neon usa certificati
    // pubblicamente affidabili). Solo in caso di problemi di catena si può impostare
    // PG_SSL_NO_VERIFY=true (sconsigliato: espone a man-in-the-middle).
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: process.env.PG_SSL_NO_VERIFY !== 'true' },
    })
    await pool.query('CREATE TABLE IF NOT EXISTS catalive_state (id int PRIMARY KEY, data jsonb NOT NULL)')
    const res = await pool.query('SELECT data FROM catalive_state WHERE id = 1')
    if (res.rows[0]) {
      db = normalize(res.rows[0].data)
    } else {
      db = emptyDb()
      await pool.query('INSERT INTO catalive_state (id, data) VALUES (1, $1::jsonb)', [JSON.stringify(db)])
    }
    backend = 'postgres'
    console.log('[CatAlive] Store: PostgreSQL/Neon connesso (persistente).')
  } else {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    try {
      db = normalize(JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')))
    } catch {
      db = emptyDb()
    }
    backend = 'file'
    console.log('[CatAlive] Store: file locale data/db.json.')
  }
  return db
}

export function loadDb() {
  if (!db) throw new Error('Store non inizializzato: chiama initStore() all\'avvio.')
  return db
}

// Persistenza serializzata (una scrittura alla volta) per evitare race/perdite.
let writeChain = Promise.resolve()
export function saveDb() {
  if (!db) return writeChain
  const snapshot = JSON.stringify(db)
  writeChain = writeChain
    .then(async () => {
      if (backend === 'postgres') {
        await pool.query('UPDATE catalive_state SET data = $1::jsonb WHERE id = 1', [snapshot])
      } else {
        const tmp = DB_FILE + '.tmp'
        fs.writeFileSync(tmp, snapshot)
        fs.renameSync(tmp, DB_FILE)
      }
    })
    .catch((e) => console.error('[CatAlive] Errore salvataggio store:', e.message))
  return writeChain
}

// Attende il completamento di tutte le scritture in coda (usato allo spegnimento).
export function flushDb() {
  return writeChain
}
