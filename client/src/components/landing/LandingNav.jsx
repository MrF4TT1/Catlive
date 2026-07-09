import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../Icon.jsx'

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Movies', href: '#trending' },
  { label: 'Series', href: '#continue' },
  { label: 'Trending', href: '#trending' },
  { label: 'My List', href: '#recommended' },
]

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass-panel border-b border-brand-500/20 shadow-glow-soft'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center gap-8 px-5 md:px-10 h-16 md:h-[72px]">
        {/* Logo neon */}
        <a href="#home" className="flex items-center gap-2.5 group shrink-0">
          <span
            className="relative w-9 h-9 rounded-xl flex items-center justify-center animate-glow"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 20px rgba(123,44,255,0.75)' }}
          >
            <Icon name="play" size={18} className="text-white" />
          </span>
          <span className="font-display text-2xl font-black tracking-tight text-gradient neon-text">CatAlive</span>
        </a>

        {/* Menu */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold">
          {LINKS.map((l, i) => (
            <a
              key={l.label + i}
              href={l.href}
              className="relative text-brand-100/70 hover:text-white transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-royal after:to-glow after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Azioni a destra */}
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            aria-label="Cerca"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-100/70 hover:text-white hover:bg-white/5 transition"
          >
            <Icon name="search" size={20} />
          </button>
          <button
            aria-label="Notifiche"
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-brand-100/70 hover:text-white hover:bg-white/5 transition"
          >
            <Icon name="bell" size={20} />
            <span aria-hidden="true" className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-glow shadow-neon-sm animate-glow" />
          </button>
          <Link
            to="/login"
            title="Accedi"
            aria-label="Accedi"
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm hover:scale-105 transition"
            style={{ background: 'linear-gradient(135deg,#7B2CFF,#c084fc)', boxShadow: '0 0 16px rgba(123,44,255,0.6)' }}
          >
            <Icon name="logout" size={17} className="rotate-180" />
          </Link>
          <Link to="/login" className="hidden sm:inline-flex btn-primary !px-5 !py-2 text-sm">
            Accedi
          </Link>
        </div>
      </div>
    </header>
  )
}
