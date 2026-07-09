import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Poster from './Poster.jsx'

// Card orizzontale "Continue Watching": anteprima 16:9, barra di avanzamento
// viola neon, pulsante Play circolare, tempo rimanente.
export default function ContinueCard({ item, index = 0 }) {
  return (
    <div
      className="group relative shrink-0 w-72 md:w-80 snap-start animate-fadeup"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="relative aspect-video rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-glow-card transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.03] group-hover:ring-2 group-hover:ring-glow/60 group-hover:shadow-glow-strong">
        <Poster title={item.title} kind={item.kind} minimal />
        <Link to="/login" aria-label={`Riprendi ${item.title}`} className="absolute inset-0 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

        {/* rimanente */}
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-lilac backdrop-blur-sm ring-1 ring-white/10">
          <Icon name="clock" size={12} /> {item.remaining} rimasti
        </span>

        {/* play circolare centrale (decorativo) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 24px rgba(192,132,252,0.75)' }}
          >
            <Icon name="play" size={22} />
          </span>
        </div>

        {/* testo + barra avanzamento */}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="font-hero font-bold text-white leading-tight line-clamp-1">{item.title}</div>
              <div className="text-[11px] text-mute mt-0.5">{item.episode}</div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-lilac shrink-0">
              <Icon name="star" size={12} className="text-glow" /> {item.rating}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${item.progress}%`,
                background: 'linear-gradient(90deg,#7B2CFF,#a855f7,#c084fc)',
                boxShadow: '0 0 10px rgba(192,132,252,0.9)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
