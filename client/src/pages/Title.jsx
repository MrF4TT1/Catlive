import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from '../components/Icon.jsx'
import { coverGradient, formatTime } from '../lib/art.js'
import { catLabel } from '../lib/categories.js'

export default function Title() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, user, demo } = useAuth()
  const [m, setM] = useState(null)
  const [error, setError] = useState('')
  const [season, setSeason] = useState(null)
  const [prog, setProg] = useState({}) // playableId -> record
  const [coverV, setCoverV] = useState(0) // per forzare reload immagine
  const fileRef = useRef(null)

  const reload = () => {
    api.get('/media/' + id).then((d) => {
      setM(d)
      if (d.type === 'show' && d.episodes.length) setSeason(d.episodes[0].season)
    }).catch((e) => setError(e.message))
  }
  useEffect(() => { reload() }, [id])
  useEffect(() => {
    if (!profile) return
    api.get('/progress?profileId=' + profile.id).then((list) => {
      const map = {}
      for (const p of list) map[p.playableId] = p
      setProg(map)
    }).catch(() => {})
  }, [id, profile])

  if (error) return <p className="text-brand-200/60">{error}</p>
  if (!m) return <div className="py-32 text-center text-brand-200/60">Caricamento…</div>

  const isAdmin = user?.role === 'admin' && !demo
  const goWatch = (pid, opts = '') => navigate(`/watch/${pid}?parent=${m.id}${opts}`)

  const onCover = async (file) => {
    if (!file) return
    const form = new FormData()
    form.append('mediaId', m.id)
    form.append('file', file)
    try {
      const res = await fetch('/api/cover', { method: 'POST', credentials: 'include', body: form })
      if (!res.ok) throw new Error((await res.json()).error || 'Errore')
      setM({ ...m, hasPoster: true })
      setCoverV((v) => v + 1)
    } catch (e) {
      alert(e.message)
    }
  }

  const bg = m.hasPoster ? undefined : coverGradient(m.title)

  return (
    <div className="max-w-4xl animate-fadeup">
      {/* HERO */}
      <div className="relative rounded-3xl overflow-hidden mb-8 ring-1 ring-brand-500/20 shadow-neon">
        <div className="absolute inset-0" style={{ background: bg }}>
          {m.hasPoster && (
            <img src={`/api/cover/${m.id}?v=${coverV}`} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
        <div className="relative p-7 md:p-10 pt-28 md:pt-36">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-brand-300 bg-brand-500/15 ring-1 ring-brand-500/30 rounded-full px-3 py-1">
            <Icon name={m.type === 'show' ? 'tv' : 'film'} size={14} />
            {catLabel(m.category)}
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-black mt-3 neon-text">{m.title}</h1>
          <p className="text-brand-100/70 mt-1">
            {m.year ? m.year + ' · ' : ''}
            {m.type === 'show' ? 'Serie TV' : 'Film'}
          </p>

          {m.type === 'movie' && <MovieActions m={m} prog={prog[m.playableId]} goWatch={goWatch} />}

          {isAdmin && (
            <div className="mt-5">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onCover(e.target.files[0])} />
              <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm">
                <Icon name="image" size={16} /> {m.hasPoster ? 'Cambia copertina' : 'Aggiungi copertina'}
              </button>
            </div>
          )}
        </div>
      </div>

      {m.type === 'show' && <Episodes m={m} season={season} setSeason={setSeason} prog={prog} goWatch={goWatch} />}
    </div>
  )
}

function MovieActions({ m, prog, goWatch }) {
  const resumable = prog && !prog.finished && prog.position > 5
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <button onClick={() => goWatch(m.playableId, resumable ? '' : '')} className="btn-neon">
        <Icon name="play" size={18} />
        {resumable ? `Riprendi · ${formatTime(prog.position)}` : 'Riproduci'}
      </button>
      {resumable && (
        <button onClick={() => goWatch(m.playableId, '&restart=1')} className="btn-ghost">
          <Icon name="restart" size={18} /> Da capo
        </button>
      )}
    </div>
  )
}

function Episodes({ m, season, setSeason, prog, goWatch }) {
  const seasons = [...new Set(m.episodes.map((e) => e.season))].sort((a, b) => a - b)
  const eps = m.episodes.filter((e) => e.season === season)

  // episodio "continua": ultimo non finito per updatedAt
  let resumeEp = null
  let best = -1
  for (const e of m.episodes) {
    const p = prog[e.id]
    if (p && !p.finished && p.position > 5 && p.updatedAt > best) { best = p.updatedAt; resumeEp = e }
  }

  return (
    <div>
      {resumeEp && (
        <button onClick={() => goWatch(resumeEp.id)} className="btn-neon mb-6">
          <Icon name="restart" size={18} /> Continua S{resumeEp.season}E{resumeEp.episode}
        </button>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => setSeason(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${s === season ? 'text-white shadow-neon-sm' : 'bg-white/5 text-brand-200/70 hover:bg-white/10'}`}
            style={s === season ? { background: 'linear-gradient(120deg,#9333ea,#ec4899)' } : undefined}
          >
            Stagione {s}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {eps.map((e, i) => {
          const p = prog[e.id]
          const pct = p && p.duration ? Math.min(100, Math.round((p.position / p.duration) * 100)) : 0
          return (
            <li
              key={e.id}
              className="group glass rounded-2xl p-3 flex items-center gap-4 hover:shadow-neon-sm transition animate-fadeup"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <span className="font-display text-lg font-bold text-brand-400 w-10 text-center">{e.episode}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{e.title || `Episodio ${e.episode}`}</div>
                {pct > 0 && (
                  <div className="mt-1.5 h-1 bg-white/10 rounded">
                    <div className="h-full rounded" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
                  </div>
                )}
                {p?.finished && <span className="inline-flex items-center gap-1 text-xs text-brand-300/80 mt-1"><Icon name="check" size={13} /> Visto</span>}
              </div>
              <button
                onClick={() => goWatch(e.id)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition"
                style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)', boxShadow: '0 0 14px rgba(168,85,247,0.5)' }}
              >
                <Icon name="play" size={18} />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
