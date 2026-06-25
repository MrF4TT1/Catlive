import { randomUUID, createHash } from 'crypto'
import { loadDb, saveDb } from './store.js'
import { hashPassword } from './auth.js'

function idFor(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 16)
}

// Video con licenza libera (Blender Foundation / Creative Commons o public domain),
// MP4/H.264 riproducibili nativamente nel browser. Tutti gli URL verificati (HTTP 206).
// Due fonti diverse per resilienza: download.blender.org e test-videos.co.uk.
const S = {
  bunny: 'https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4',
  sintel: 'https://download.blender.org/durian/trailer/sintel_trailer-720p.mp4',
  jelly: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4',
  bunnyClip: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  sintelClip: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
  jellyClip: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
}

/**
 * In modalità demo (DEMO_MODE=true) precarica un account "demo/demo" e un
 * catalogo di esempio se il database è vuoto. È idempotente: utile su host con
 * disco effimero (es. piano gratuito Render) dove i dati si azzerano ad ogni riavvio.
 */
export function seedDemo() {
  if (process.env.DEMO_MODE !== 'true') return
  const db = loadDb()
  // Idempotente e deterministico: ri-semina solo se il catalogo demo non c'è ancora
  // (non basarsi su "nessun utente", che si confonderebbe con un DB pre-esistente).
  if (db.libraries.some((l) => l.demo)) return

  const now = Date.now()

  const user = {
    id: randomUUID(),
    username: 'demo',
    password: hashPassword('demo'),
    role: 'admin',
    createdAt: now,
  }
  db.users.push(user)
  db.profiles.push({ id: randomUUID(), userId: user.id, name: 'Demo', avatar: '🐱', createdAt: now })

  const filmLib = { id: randomUUID(), name: 'Film', path: '(demo)', type: 'movie', demo: true, createdAt: now }
  const serieLib = { id: randomUUID(), name: 'Serie TV', path: '(demo)', type: 'show', demo: true, createdAt: now }
  db.libraries.push(filmLib, serieLib)

  const movies = [
    ['Big Buck Bunny', 2008, S.bunny],
    ['Sintel', 2010, S.sintel],
    ['Jellyfish', 2019, S.jelly],
  ].map(([title, year, demoUrl]) => ({
    id: idFor('demo-movie-' + title),
    libraryId: filmLib.id,
    type: 'movie',
    title,
    year,
    addedAt: now,
    demoUrl,
  }))

  const episodes = [
    [1, 1, 'Big Buck Bunny', S.bunnyClip],
    [1, 2, 'Sintel', S.sintelClip],
    [1, 3, 'Jellyfish', S.jellyClip],
  ].map(([season, episode, title, demoUrl]) => ({
    id: idFor(`demo-ep-${season}-${episode}`),
    season,
    episode,
    title,
    demoUrl,
  }))

  const show = {
    id: idFor('demo-show-shorts'),
    libraryId: serieLib.id,
    type: 'show',
    title: 'Corti Demo',
    year: 2019,
    addedAt: now,
    episodes,
  }

  db.media.push(...movies, show)
  saveDb()
  console.log('[CatAlive] Seed demo creato → login: demo / demo')
}
