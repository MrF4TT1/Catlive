import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Poster from './Poster.jsx'

// Card griglia "Recommended": cover, titolo, categoria, rating, pulsante "+" neon.
export default function RecommendedCard({ item, index = 0 }) {
  const [added, setAdded] = useState(false)

  return (
    <div
      className="group relative animate-fadeup"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
    >
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-glow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.05] group-hover:ring-2 group-hover:ring-glow/60 group-hover:shadow-glow-strong">
        <Poster title={item.title} kind={item.kind} minimal />
        <Link to="/login" aria-label={item.title} className="absolute inset-0 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {item.isNew && <span className="badge-new absolute top-3 left-3 z-20">New</span>}

        {/* pulsante "+" neon */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setAdded((v) => !v)
          }}
          aria-label={added ? 'Rimuovi dalla lista' : 'Aggiungi alla lista'}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          style={{
            background: added ? 'linear-gradient(135deg,#7B2CFF,#c084fc)' : 'rgba(10,6,20,0.55)',
            border: '1px solid rgba(192,132,252,0.5)',
            backdropFilter: 'blur(8px)',
            boxShadow: added ? '0 0 18px rgba(192,132,252,0.85)' : 'none',
          }}
        >
          <Icon name={added ? 'check' : 'plus'} size={18} />
        </button>

        {/* play su hover (decorativo) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 22px rgba(192,132,252,0.8)' }}
          >
            <Icon name="play" size={20} />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="font-hero font-bold text-[15px] leading-tight text-white line-clamp-1">{item.title}</div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="uppercase tracking-wider text-glow/90">{item.genre}</span>
            <span className="flex items-center gap-1 font-bold text-lilac">
              <Icon name="star" size={11} className="text-glow" /> {item.rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
