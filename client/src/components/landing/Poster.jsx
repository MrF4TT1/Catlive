import Icon from '../Icon.jsx'
import { coverGradient } from '../../lib/art.js'

const KIND_ICON = { Film: 'film', Serie: 'tv', Anime: 'anime' }

// Copertina neon procedurale (nessuna immagine esterna): gradiente deterministico
// dal titolo + iconografia + bagliore centrale morbido.
// `minimal` = solo sfondo/bagliore (per card 16:9 dove il titolo è già in overlay).
export default function Poster({ title, kind = 'Film', className = '', minimal = false }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ background: coverGradient(title) }}>
      {/* bagliore radiale centrale */}
      <div className="absolute inset-0 opacity-60 bg-radial-violet animate-pulseglow" />
      {/* trama a griglia sottile */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'radial-gradient(circle at 50% 35%, black, transparent 75%)',
        }}
      />
      {/* icona + titolo (nascosti in modalità minimal) */}
      {!minimal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <Icon name={KIND_ICON[kind] || 'film'} size={30} className="mb-2 text-white/70" />
          <span className="font-hero text-lg font-bold leading-tight text-white/95 drop-shadow neon-text line-clamp-3">
            {title}
          </span>
        </div>
      )}
    </div>
  )
}
