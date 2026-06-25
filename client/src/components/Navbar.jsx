import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { profile, demo, logout } = useAuth()
  const navigate = useNavigate()

  const linkCls = ({ isActive }) =>
    `hover:text-white transition ${isActive ? 'text-white' : 'text-zinc-300'}`

  return (
    <header className="fixed top-0 inset-x-0 z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent">
      <div className="flex items-center gap-6 px-4 md:px-10 h-16">
        <Link to="/" className="text-brand-500 font-extrabold text-2xl tracking-tight">
          🐾 CatAlive
        </Link>
        {demo && (
          <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider bg-brand-600/30 text-brand-300 ring-1 ring-brand-500/40 rounded px-1.5 py-0.5">
            Demo
          </span>
        )}
        <nav className="hidden md:flex gap-5 text-sm">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/search" className={linkCls}>Cerca</NavLink>
          <NavLink to="/settings" className={linkCls}>Librerie</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link to="/search" className="md:hidden text-zinc-300 text-lg">🔍</Link>
          <button
            onClick={() => navigate('/profiles')}
            className="text-2xl leading-none hover:scale-110 transition"
            title="Cambia profilo"
          >
            {profile?.avatar || '🐱'}
          </button>
          <button onClick={logout} className="text-xs text-zinc-400 hover:text-white">
            Esci
          </button>
        </div>
      </div>
    </header>
  )
}
