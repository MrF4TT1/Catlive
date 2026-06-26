import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { coverGradient, accent } from '../lib/art.js'

const PREVIEW_SECONDS = 9

export default function Card({ item, index = 0 }) {
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
      className="group relative shrink-0 w-36 md:w-44 animate-fadeup"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div
        className="card-tilt aspect-[2/3] rounded-2xl overflow-hidden relative ring-1 ring-white/10 group-hover:ring-2"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)', '--tw-ring-color': ring }}
      >
        {showImg ? (
          <img src={`/api/cover/${item.id}`} alt={item.title} loading="lazy" onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center" style={{ background: coverGradient(item.title) }}>
            <Icon name={item.type === 'show' ? 'tv' : 'film'} size={30} className="mb-2 opacity-70" />
            <span className="font-display text-sm font-bold leading-tight line-clamp-3 neon-text">{item.title}</span>
            {item.year ? <span className="text-xs text-white/55 mt-1">{item.year}</span> : null}
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

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-2.5">
          <div className="font-semibold text-sm leading-tight line-clamp-2 drop-shadow">{item.title}</div>
          <div className="text-[10px] uppercase tracking-wider text-brand-300/90 mt-0.5">
            {item.type === 'show' ? `${item.episodeCount ?? ''} episodi`.trim() : 'Film'}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)', boxShadow: `0 0 22px ${ring}` }}>
            <Icon name="play" size={22} />
          </span>
        </div>

        {typeof progress === 'number' && progress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50">
            <div className="h-full" style={{ width: `${Math.min(100, progress)}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899)' }} />
          </div>
        )}
      </div>
    </Link>
  )
}
