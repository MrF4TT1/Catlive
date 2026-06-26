import { loadDb, saveDb } from './store.js'
import { parseEpisodeNumber, idFor } from './scanner.js'

/**
 * Sistemazione una-tantum (idempotente): nelle librerie Serie/Anime, i contenuti
 * catalogati per errore come "film" (es. file 01.mp4, 02.mp4 senza pattern SxxExx)
 * vengono raggruppati in UNA sola serie con episodi. Gli ID (e quindi le chiavi
 * dello storage) restano invariati, così i video continuano a funzionare.
 */
export function migrate() {
  const db = loadDb()
  let changed = false

  for (const lib of db.libraries) {
    const isSeries = lib.type === 'show' || lib.category === 'serie' || lib.category === 'anime'
    if (!isSeries) continue

    const movies = db.media.filter((m) => m.libraryId === lib.id && m.type === 'movie')
    if (movies.length === 0) continue

    const showId = idFor(lib.id + '|show')
    let show = db.media.find((m) => m.type === 'show' && m.id === showId)
    if (!show) {
      show = { id: showId, libraryId: lib.id, type: 'show', title: lib.name, episodes: [], addedAt: Date.now() }
      db.media.push(show)
    }

    // ordina i film per titolo "numerico" (01,02,...,10) prima di assegnare gli episodi
    movies.sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { numeric: true }))
    let n = show.episodes.length
    for (const mv of movies) {
      const pe = parseEpisodeNumber(mv.title || '')
      const episode = pe?.episode || ++n
      let title = mv.title
      if (!title || /^\d{1,3}$/.test(title)) title = `Episodio ${episode}`
      show.episodes.push({ id: mv.id, season: pe?.season || 1, episode, title, storageKey: mv.storageKey, size: mv.size })
      if (mv.posterKey && !show.posterKey) show.posterKey = mv.posterKey
    }
    show.episodes.sort((a, b) => a.season - b.season || a.episode - b.episode)
    db.media = db.media.filter((m) => !(m.libraryId === lib.id && m.type === 'movie'))
    changed = true
    console.log(`[CatAlive] Migrazione: "${lib.name}" → serie con ${show.episodes.length} episodi.`)
  }

  if (changed) saveDb()
}
