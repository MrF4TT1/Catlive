import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from './Icon.jsx'
import { initials, accent } from '../lib/art.js'

export default function Navbar() {
  const { profile, demo, logout } = useAuth()
  const navigate = useNavigate()

  const linkCls = ({ isActive }) =>
    `relative px-1 py-1 transition-colors duration-300 ${isActive ? 'text-white' : 'text-brand-200/70 hover:text-white'} after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-brand-500 after:to-neon-pink after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`

  const av = profile?.name || 'U'

  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="glass border-b border-brand-500/20">
        <div className="flex items-center gap-7 px-4 md:px-10 h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative w-8 h-8 rounded-lg flex items-center justify-center animate-glow" style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)', boxShadow: '0 0 18px rgba(168,85,247,0.7)' }}>
              <Icon name="play" size={18} className="text-white" />
            </span>
            <span className="font-display text-2xl font-black tracking-tight neon-text bg-gradient-to-r from-brand-300 via-neon-pink to-brand-400 bg-clip-text text-transparent">
              CatAlive
            </span>
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-semibold">
            <NavLink to="/" end className={linkCls}>Home</NavLink>
            <NavLink to="/search" className={linkCls}>Cerca</NavLink>
            <NavLink to="/settings" className={linkCls}>Librerie</NavLink>
          </nav>

          {demo && (
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest bg-neon-pink/20 text-neon-pink ring-1 ring-neon-pink/40 rounded px-2 py-0.5 animate-glow">
              Demo
            </span>
          )}

          <div className="ml-auto flex items-center gap-4">
            <Link to="/search" className="md:hidden text-brand-200/80 hover:text-white">
              <Icon name="search" size={20} />
            </Link>
            <button
              onClick={() => navigate('/profiles')}
              title="Cambia profilo"
              className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm text-white hover:scale-110 transition"
              style={{ background: `linear-gradient(135deg, ${accent(av)}, #ec4899)`, boxShadow: `0 0 14px ${accent(av)}` }}
            >
              {initials(av)}
            </button>
            <button onClick={logout} className="text-brand-200/60 hover:text-neon-pink transition" title="Esci">
              <Icon name="logout" size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
