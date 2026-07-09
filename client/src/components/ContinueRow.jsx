import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { coverGradient, accent, formatTime } from '../lib/art.js'

// "Continua a guardare" con dati reali: card 16:9, barra viola neon,
// play circolare, tempo rimanente. Riprende direttamente da /watch.
function ContinueCard({ rec, index }) {
  const [imgOk, setImgOk] = useState(true)
  const pct = rec.duration ? Math.min(100, Math.round((rec.position / rec.duration) * 100)) : 0
  const remaining = rec.duration ? Math.max(0, rec.duration - rec.position) : 0
  const showImg = rec.hasPoster && imgOk
  const ring = accent(rec.title)

  return (
    <Link
      to={`/watch/${rec.playableId}?parent=${rec.parentId}`}
      className="group relative shrink-0 w-72 md:w-80 snap-start animate-fadeup"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div
        className="relative aspect-video rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-glow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:ring-2 group-hover:shadow-glow-strong"
        style={{ '--tw-ring-color': ring }}
      >
        {showImg ? (
          <img
            src={`/api/cover/${rec.parentId}`}
            alt={rec.title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: coverGradient(rec.title) }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

        {remaining > 0 && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-lilac backdrop-blur-sm ring-1 ring-white/10">
            <Icon name="clock" size={12} /> {formatTime(remaining)} rimasti
          </span>
        )}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 24px rgba(192,132,252,0.75)' }}
          >
            <Icon name="play" size={22} />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <div className="font-hero font-bold text-white leading-tight line-clamp-1">{rec.title}</div>
          <div className="text-[11px] uppercase tracking-wider text-glow/90 mt-0.5">
            {rec.type === 'show' ? 'Serie' : 'Film'}
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg,#7B2CFF,#a855f7,#c084fc)',
                boxShadow: '0 0 10px rgba(192,132,252,0.9)',
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ContinueRow({ items, title = 'Continua a guardare', icon = 'restart' }) {
  if (!items || items.length === 0) return null
  return (
    <section className="mb-10">
      <div className="mb-5">
        <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-hero font-bold tracking-tight">
          <span className="text-glow drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]">
            <Icon name={icon} size={22} />
          </span>
          <span className="text-white">{title}</span>
        </h2>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-3 hide-scrollbar snap-x -mx-4 px-4 md:mx-0 md:px-0">
        {items.map((rec, i) => (
          <ContinueCard key={rec.playableId || rec.parentId} rec={rec} index={i} />
        ))}
      </div>
    </section>
  )
}
