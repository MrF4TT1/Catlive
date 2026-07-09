import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'

const COLS = [
  { title: 'Esplora', links: ['Home', 'Movies', 'Series', 'Trending', 'My List'] },
  { title: 'Azienda', links: ['Chi siamo', 'Carriere', 'Press', 'Blog'] },
  { title: 'Supporto', links: ['Centro assistenza', 'Dispositivi', 'Account', 'Contatti'] },
  { title: 'Legale', links: ['Termini', 'Privacy', 'Cookie', 'Preferenze'] },
]

// Icone social minimal (SVG inline), tinta viola.
function Social({ children, label }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="w-10 h-10 rounded-xl flex items-center justify-center text-glow/80 ring-1 ring-brand-500/25 bg-white/5 hover:text-white hover:bg-royal/20 hover:ring-glow/60 hover:shadow-neon-sm transition-all duration-300"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="relative mt-24">
      {/* linea luminosa sottile */}
      <div className="glow-divider" />

      <div className="mx-auto max-w-7xl px-5 md:px-10 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 18px rgba(123,44,255,0.7)' }}
              >
                <Icon name="play" size={18} className="text-white" />
              </span>
              <span className="font-display text-xl font-black text-gradient">CatAlive</span>
            </div>
            <p className="mt-4 text-sm text-mute max-w-xs leading-relaxed">
              Cinema illimitato. Serie senza fine. Emozioni in qualità straordinaria — ovunque tu sia.
            </p>
            <div className="mt-5 flex gap-3">
              <Social label="X">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-6.6L5.9 22H2.8l7.5-8.6L2.5 2h6.6l4.5 6z" /></svg>
              </Social>
              <Social label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              </Social>
              <Social label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.5 12 5.5 12 5.5s-6 0-7.9.6A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.6 7.9.6 7.9.6s6 0 7.9-.6a3 3 0 0 0 2.1-2.1c.3-1.9.4-3.8.4-3.8s0-1.9-.4-3.8zM10 15V9l5.2 3z" /></svg>
              </Social>
              <Social label="Discord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.4A16 16 0 0 0 15.4 4l-.2.4a12 12 0 0 1 3.5 1.8 12 12 0 0 0-10.4 0A12 12 0 0 1 11.8 4.4L11.6 4a16 16 0 0 0-3.9 1.4C4.6 9.2 3.9 12.9 4.2 16.6a16 16 0 0 0 4.9 2.5l.6-1a10 10 0 0 1-1.6-.8l.4-.3a11 11 0 0 0 9 0l.4.3a10 10 0 0 1-1.6.8l.6 1a16 16 0 0 0 4.9-2.5c.4-4.3-.7-8-3.9-11.2zM9.5 14.4c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.5.8 1.4 1.6c0 .9-.6 1.6-1.4 1.6zm5 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.5.8 1.4 1.6c0 .9-.6 1.6-1.4 1.6z" /></svg>
              </Social>
            </div>
          </div>

          {/* Colonne link */}
          {COLS.map((col) => (
            <div key={col.title}>
              <h3 className="font-hero font-semibold text-sm text-white/90 mb-3">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-mute hover:text-lilac transition-colors duration-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mute/70">
          <p>© 2026 CatAlive. Il tuo cinema personale.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Tutti i sistemi operativi
            <Link to="/login" className="ml-4 text-glow hover:text-lilac transition-colors">
              Accedi →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
