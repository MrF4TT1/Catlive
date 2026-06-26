import fs from 'fs'
import path from 'path'
import { createHash } from 'crypto'

const VIDEO_EXT = new Set([
  '.mp4', '.m4v', '.mkv', '.webm', '.mov', '.avi', '.mpg', '.mpeg', '.flv', '.wmv', '.ts',
])

// Tag di qualità/encoding da rimuovere dai titoli ricavati dai nomi file.
const JUNK = /\b(1080p|720p|2160p|480p|4k|uhd|x264|x265|h264|h265|hevc|xvid|divx|bluray|blu-ray|brrip|bdrip|webrip|web-dl|webdl|hdrip|dvdrip|hdtv|remux|proper|repack|aac|ac3|dts|dd5\.?1|truehd|atmos|10bit|hdr|ita|eng|sub|multi)\b/gi

export function idFor(str) {
  return createHash('sha1').update(str).digest('hex').slice(0, 16)
}

function walk(dir, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else if (VIDEO_EXT.has(path.extname(e.name).toLowerCase())) out.push(full)
  }
  return out
}

function clean(name) {
  return name
    .replace(/\.[a-z0-9]+$/i, '')   // estensione
    .replace(/[._]+/g, ' ')          // punti/underscore -> spazi
    .replace(/[\[(].*?[\])]/g, ' ')  // contenuto tra parentesi
    .replace(JUNK, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function safeSize(file) {
  try {
    return fs.statSync(file).size
  } catch {
    return 0
  }
}

// Riconosce stagione/episodio da pattern come S01E02, 1x02, ecc.
function parseEpisode(base) {
  const m =
    base.match(/[sS](\d{1,2})[\s._-]*[eE](\d{1,3})/) ||
    base.match(/\b(\d{1,2})x(\d{1,3})\b/)
  if (!m) return null
  return { season: parseInt(m[1], 10), episode: parseInt(m[2], 10), index: m.index, length: m[0].length }
}

export function parseFile(filePath, libraryType) {
  const base = path.basename(filePath)
  const yearMatch = base.match(/\b(19|20)\d{2}\b/)
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null

  const ep = libraryType !== 'movie' ? parseEpisode(base) : null
  if (ep) {
    let showTitle = clean(base.slice(0, ep.index))
    if (!showTitle) showTitle = clean(path.basename(path.dirname(filePath)))
    if (year) showTitle = showTitle.replace(String(year), '').trim()
    let epTitle = clean(base.slice(ep.index + ep.length))
    return {
      kind: 'episode',
      showTitle: showTitle || 'Sconosciuto',
      season: ep.season,
      episode: ep.episode,
      title: epTitle || `Episodio ${ep.episode}`,
      year,
    }
  }

  let title = clean(base)
  if (year) title = title.replace(String(year), '').trim()
  return { kind: 'movie', title: title || base, year }
}

/**
 * Scansiona la cartella di una libreria e restituisce gli elementi multimediali.
 * Gli ID sono deterministici (hash del percorso) così le ri-scansioni
 * mantengono lo stato di visione collegato.
 */
export function scanLibrary(library) {
  const files = walk(library.path)
  const movies = []
  const shows = new Map()

  for (const file of files) {
    const parsed = parseFile(file, library.type)
    if (parsed.kind === 'movie') {
      movies.push({
        id: idFor(file),
        libraryId: library.id,
        type: 'movie',
        title: parsed.title,
        year: parsed.year,
        path: file,
        size: safeSize(file),
        addedAt: Date.now(),
      })
    } else {
      const key = parsed.showTitle.toLowerCase()
      if (!shows.has(key)) {
        shows.set(key, {
          id: idFor(library.id + '|' + key),
          libraryId: library.id,
          type: 'show',
          title: parsed.showTitle,
          year: parsed.year,
          episodes: [],
          addedAt: Date.now(),
        })
      }
      shows.get(key).episodes.push({
        id: idFor(file),
        season: parsed.season,
        episode: parsed.episode,
        title: parsed.title,
        path: file,
        size: safeSize(file),
      })
    }
  }

  for (const show of shows.values()) {
    show.episodes.sort((a, b) => a.season - b.season || a.episode - b.episode)
  }

  return [...movies, ...shows.values()]
}
