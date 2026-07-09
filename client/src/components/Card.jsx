import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { coverGradient, accent } from '../lib/art.js'

const PREVIEW_SECONDS = 9

export default function Card({ item, index = 0, grid = false }) {
  const [imgOk, setImgOk] = useState(true)
  const [preview, setPreview] = useState(false)
  const timer = useRef(null)
  const videoRef = useRef(null)
  const showImg = item.hasPoster && imgOk
  const ring = accent(item.title)
  const progress = item._progress

  const enter = () => {
    if (!item.previewId) return
    timer.current = setTimeout(() => setPreview(true), 550) // anteprima dopo breve hover
  }
  const leave = () => {
    clearTimeout(timer.current)
    setPreview(false)
  }
  // Tieni l'anteprima entro ~9s come "intro"
  const onTime = () => {
    const v = videoRef.current
    if (v && v.currentTime > PREVIEW_SECONDS) v.currentTime = 0
  }

  return (
    <Link
      to={`/title/${item.id}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      className={`group relative animate-fadeup ${grid ? 'w-full' : 'shrink-0 w-40 md:w-48 snap-start'}`}
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div
        className="aspect-[2/3] rounded-3xl overflow-hidden relative ring-1 ring-white/10 shadow-glow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.08] group-hover:ring-2 group-hover:shadow-glow-strong"
        style={{ '--tw-ring-color': ring }}
      >
        {showImg ? (
          <img src={`/api/cover/${item.id}`} alt={item.title} loading="lazy" onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: coverGradient(item.title) }}>
            <Icon name={item.type === 'show' ? 'tv' : 'film'} size={34} className="opacity-40" />
          </div>
        )}

        {/* anteprima video muta al passaggio del mouse */}
        {preview && item.previewId && (
          <video
            ref={videoRef}
            src={`/api/stream/${item.previewId}`}
            muted
            autoPlay
            playsInline
            onTimeUpdate={onTime}
            className="absolute inset-0 w-full h-full object-cover animate-popin"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-95" />
        {/* riflesso vetro in alto */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent opacity-50" />

        {item._isNew && <span className="badge-new absolute top-3 left-3">New</span>}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="font-hero font-bold text-[15px] leading-tight line-clamp-2 drop-shadow">{item.title}</div>
          <div className="text-[10px] uppercase tracking-wider text-glow/90 mt-0.5">
            {item.type === 'show' ? `${item.episodeCount ?? ''} episodi`.trim() : `Film${item.year ? ` · ${item.year}` : ''}`}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span className="w-14 h-14 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: `0 0 26px ${ring}` }}>
            <Icon name="play" size={24} />
          </span>
        </div>

        {typeof progress === 'number' && progress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50">
            <div className="h-full" style={{ width: `${Math.min(100, progress)}%`, background: 'linear-gradient(90deg,#7B2CFF,#a855f7,#c084fc)' }} />
          </div>
        )}
      </div>
    </Link>
  )
}
