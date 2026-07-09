import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'
import Poster from './Poster.jsx'

// Card verticale "Trending": poster, overlay gradiente, titolo, rating, durata,
// badge NEW. Hover: zoom 1.08 + glow viola + lift + play centrale.
export default function PosterCard({ item, index = 0 }) {
  return (
    <div
      className="group relative shrink-0 w-40 md:w-48 snap-start animate-fadeup"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="relative aspect-[2/3] rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-glow-card transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.08] group-hover:ring-2 group-hover:ring-glow/70 group-hover:shadow-glow-strong">
        <Poster title={item.title} kind={item.kind} minimal />
        <Link to="/login" aria-label={item.title} className="absolute inset-0 z-10" />

        {/* overlay gradiente nero → trasparente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
        {/* riflesso vetro in alto */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent opacity-60" />

        {/* badge NEW */}
        {item.isNew && <span className="badge-new absolute top-3 left-3">New</span>}

        {/* rating in alto a destra */}
        <span className="absolute top-3 right-3 flex items-center gap-1 rounded-lg bg-black/50 px-1.5 py-0.5 text-[11px] font-bold text-lilac backdrop-blur-sm ring-1 ring-white/10">
          <Icon name="star" size={12} className="text-glow" />
          {item.rating}
        </span>

        {/* play centrale su hover (decorativo) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <span
            className="w-14 h-14 rounded-full flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 26px rgba(192,132,252,0.8)' }}
          >
            <Icon name="play" size={24} />
          </span>
        </div>

        {/* info in basso */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <div className="font-hero font-bold text-[15px] leading-tight text-white line-clamp-1 drop-shadow">
            {item.title}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-mute">
            <span className="uppercase tracking-wider text-glow/90">{item.kind}</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1">
              <Icon name="clock" size={11} /> {item.duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
