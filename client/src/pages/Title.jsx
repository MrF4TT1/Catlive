import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'

function hue(str) {
  let h = 0
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

export default function Title() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [m, setM] = useState(null)
  const [error, setError] = useState('')
  const [season, setSeason] = useState(null)

  useEffect(() => {
    api
      .get('/media/' + id)
      .then((d) => {
        setM(d)
        if (d.type === 'show' && d.episodes.length) setSeason(d.episodes[0].season)
      })
      .catch((e) => setError(e.message))
  }, [id])

  if (error) return <p className="text-zinc-400">{error}</p>
  if (!m) return <p className="text-zinc-400">Caricamento…</p>

  const h = hue(m.title)
  const hero = `linear-gradient(120deg, hsl(${h} 55% 22%), hsl(${(h + 50) % 360} 50% 10%))`

  return (
    <div className="max-w-3xl">
      <div
        className="rounded-xl p-8 mb-6 ring-1 ring-white/10"
        style={{ background: hero }}
      >
        <span className="text-5xl">{m.type === 'show' ? '📺' : '🎬'}</span>
        <h1 className="text-3xl font-bold mt-3">{m.title}</h1>
        <p className="text-zinc-300 mt-1">
          {m.year ? m.year + ' · ' : ''}
          {m.type === 'show' ? 'Serie TV' : 'Film'}
        </p>
        {m.type === 'movie' && (
          <button
            onClick={() => navigate(`/watch/${m.playableId}?parent=${m.id}`)}
            className="mt-5 bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-md font-semibold"
          >
            ▶ Riproduci
          </button>
        )}
      </div>

      {m.type === 'show' && <Seasons m={m} season={season} setSeason={setSeason} navigate={navigate} />}
    </div>
  )
}

function Seasons({ m, season, setSeason, navigate }) {
  const seasons = [...new Set(m.episodes.map((e) => e.season))].sort((a, b) => a - b)
  const eps = m.episodes.filter((e) => e.season === season)
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`px-3 py-1.5 rounded-md text-sm ${
              s === season ? 'bg-brand-600' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            Stagione {s}
          </button>
        ))}
      </div>
      <ul className="divide-y divide-white/5">
        {eps.map((e) => (
          <li key={e.id} className="flex items-center gap-4 py-3">
            <span className="text-zinc-500 w-8 text-right">{e.episode}</span>
            <span className="flex-1">{e.title || `Episodio ${e.episode}`}</span>
            <button
              onClick={() => navigate(`/watch/${e.id}?parent=${m.id}`)}
              className="text-brand-500 hover:text-brand-400 font-semibold whitespace-nowrap"
            >
              ▶ Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
