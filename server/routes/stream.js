import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { loadDb } from '../store.js'
import { requireAuth } from '../auth.js'

const r = Router()

const MIME = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/x-m4v',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo',
  '.mpg': 'video/mpeg',
  '.mpeg': 'video/mpeg',
  '.ts': 'video/mp2t',
  '.wmv': 'video/x-ms-wmv',
  '.flv': 'video/x-flv',
}

// Host consentiti per il redirect dei contenuti demo (difesa in profondità:
// evita open-redirect/SSRF anche se in futuro un demoUrl arrivasse da input non fidato).
const ALLOWED_DEMO_HOSTS = new Set(['download.blender.org', 'test-videos.co.uk'])

function isAllowedDemoUrl(url) {
  try {
    return ALLOWED_DEMO_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

// Trova la sorgente riproducibile (film o singolo episodio):
// un file locale ({ file }) oppure un URL remoto demo ({ url }).
function resolveSource(db, id) {
  for (const m of db.media) {
    if (m.type === 'movie' && m.id === id) return m.demoUrl ? { url: m.demoUrl } : { file: m.path }
    if (m.type === 'show') {
      const ep = m.episodes.find((e) => e.id === id)
      if (ep) return ep.demoUrl ? { url: ep.demoUrl } : { file: ep.path }
    }
  }
  return null
}

r.get('/:id', requireAuth, (req, res) => {
  const db = loadDb()
  const source = resolveSource(db, req.params.id)
  if (!source) return res.status(404).json({ error: 'Contenuto non trovato' })

  // Demo: rimanda al video a licenza libera (lo streaming/seek lo gestisce l'host remoto).
  if (source.url) {
    if (!isAllowedDemoUrl(source.url)) return res.status(502).json({ error: 'Sorgente non consentita' })
    return res.redirect(302, source.url)
  }

  const file = source.file
  if (!file || !fs.existsSync(file)) return res.status(404).json({ error: 'File non trovato' })

  const stat = fs.statSync(file)
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'
  const range = req.headers.range

  if (range) {
    const match = range.match(/bytes=(\d+)-(\d*)/)
    let start = match ? parseInt(match[1], 10) : 0
    let end = match && match[2] ? parseInt(match[2], 10) : stat.size - 1
    if (isNaN(start)) start = 0
    if (isNaN(end) || end >= stat.size) end = stat.size - 1
    if (start > end) {
      res.status(416).set('Content-Range', `bytes */${stat.size}`).end()
      return
    }
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': type,
    })
    fs.createReadStream(file, { start, end }).pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
    })
    fs.createReadStream(file).pipe(res)
  }
})

export default r
