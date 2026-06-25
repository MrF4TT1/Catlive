import { Link } from 'react-router-dom'

function hue(str) {
  let h = 0
  for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

export default function Card({ item }) {
  const h = hue(item.title || 'x')
  const bg = `linear-gradient(160deg, hsl(${h} 58% 30%), hsl(${(h + 45) % 360} 52% 13%))`
  const progress = item._progress // 0-100, opzionale

  return (
    <Link to={`/title/${item.id}`} className="group shrink-0 w-36 md:w-44">
      <div
        className="aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg ring-1 ring-white/5 group-hover:ring-2 group-hover:ring-brand-500/70 transition"
        style={{ background: bg }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <span className="text-4xl mb-2 drop-shadow">{item.type === 'show' ? '📺' : '🎬'}</span>
          <span className="text-sm font-semibold leading-tight line-clamp-3">{item.title}</span>
          {item.year ? <span className="text-xs text-white/60 mt-1">{item.year}</span> : null}
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-black/45 text-[10px] uppercase tracking-wide px-2 py-1 text-white/70">
          {item.type === 'show'
            ? `${item.episodeCount ?? ''} episodi`.trim()
            : 'Film'}
        </div>
        {typeof progress === 'number' && progress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
            <div className="h-full bg-brand-500" style={{ width: `${Math.min(100, progress)}%` }} />
          </div>
        )}
      </div>
    </Link>
  )
}
