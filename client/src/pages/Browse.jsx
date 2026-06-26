import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Row from '../components/Row.jsx'
import Icon from '../components/Icon.jsx'
import { CATEGORIES, catLabel } from '../lib/categories.js'

export default function Browse() {
  const { profile } = useAuth()
  const [home, setHome] = useState(null)
  const [cont, setCont] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/media/home').then(setHome).catch((e) => setError(e.message))
    if (profile) api.get('/progress/continue?profileId=' + profile.id).then(setCont).catch(() => {})
  }, [profile])

  if (error) return <p className="text-brand-200/60">{error}</p>
  if (!home) return <Loading />

  const isEmpty = home.libraries.every((l) => l.items.length === 0)
  if (isEmpty) return <EmptyState />

  const continueItems = cont.map((p) => ({
    id: p.parentId,
    title: p.title,
    type: p.type,
    hasPoster: p.hasPoster,
    _progress: p.duration ? Math.round((p.position / p.duration) * 100) : 0,
  }))

  // categorie presenti
  const present = CATEGORIES.filter((c) => home.libraries.some((l) => l.category === c.key && l.items.length))
  const visibleLibs =
    filter === 'all' ? home.libraries : home.libraries.filter((l) => l.category === filter)

  // raggruppa per categoria mantenendo l'ordine delle CATEGORIES
  const grouped = (filter === 'all' ? present : present.filter((c) => c.key === filter)).map((c) => ({
    cat: c,
    libs: visibleLibs.filter((l) => l.category === c.key && l.items.length),
  }))

  return (
    <div>
      <Hero name={profile?.name} />

      {/* filtro categorie */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')} icon="grid" label="Tutto" />
        {present.map((c) => (
          <Chip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)} icon={c.icon} label={c.label} />
        ))}
      </div>

      {filter === 'all' && <Row title="Continua a guardare" items={continueItems} icon="restart" />}
      {filter === 'all' && <Row title="Aggiunti di recente" items={home.recent} icon="spark" />}

      {grouped.map(({ cat, libs }) => (
        <div key={cat.key}>
          {libs.map((l) => (
            <Row key={l.id} title={`${l.name} · ${catLabel(cat.key)}`} items={l.items} icon={cat.icon} />
          ))}
        </div>
      ))}
    </div>
  )
}

function Chip({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
        active
          ? 'text-white shadow-neon-sm'
          : 'text-brand-200/70 hover:text-white bg-white/5 hover:bg-white/10'
      }`}
      style={active ? { background: 'linear-gradient(120deg,#9333ea,#ec4899)' } : undefined}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )
}

function Hero({ name }) {
  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden glass scanline p-7 md:p-10">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-700/30 via-transparent to-neon-pink/20" />
      <div className="relative">
        <p className="text-brand-300/80 font-semibold tracking-widest uppercase text-xs">Bentornato{name ? `, ${name}` : ''}</p>
        <h1 className="font-display text-3xl md:text-5xl font-black mt-2 neon-text bg-gradient-to-r from-brand-300 via-neon-pink to-brand-400 bg-clip-text text-transparent">
          Il tuo cinema
        </h1>
        <p className="text-brand-100/70 mt-2 max-w-lg">Anime, serie e film — tutti tuoi, in streaming da qualsiasi dispositivo.</p>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <span className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-neon-pink animate-spinslow" />
      <span className="text-brand-200/60">Caricamento…</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-lg mx-auto text-center py-24 animate-fadeup">
      <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-glow" style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)', boxShadow: '0 0 30px rgba(168,85,247,0.6)' }}>
        <Icon name="upload" size={34} className="text-white" />
      </div>
      <h1 className="font-display text-2xl font-bold mb-2 neon-text">La tua libreria è vuota</h1>
      <p className="text-brand-200/60 mb-6">Crea una libreria e carica i tuoi anime, serie e film.</p>
      <Link to="/settings" className="btn-neon">
        <Icon name="plus" size={18} /> Aggiungi una libreria
      </Link>
    </div>
  )
}
