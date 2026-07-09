import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Row from '../components/Row.jsx'
import ContinueRow from '../components/ContinueRow.jsx'
import Card from '../components/Card.jsx'
import Icon from '../components/Icon.jsx'
import { coverGradient } from '../lib/art.js'
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

  // Titolo in evidenza per l'hero: il più recente aggiunto.
  const featured = home.recent?.[0] || home.libraries.find((l) => l.items.length)?.items[0]

  // "Trending": recenti, i primi marcati come nuovi.
  const trending = (home.recent || []).map((it, i) => ({ ...it, _isNew: i < 5 }))

  // "Recommended": mix da tutte le librerie, deduplicato, escluso l'hero.
  const seen = new Set(featured ? [featured.id] : [])
  const recommended = []
  for (const l of home.libraries) {
    for (const it of l.items) {
      if (seen.has(it.id)) continue
      seen.add(it.id)
      recommended.push(it)
    }
  }
  const recGrid = recommended.slice(0, 15)

  // categorie presenti
  const present = CATEGORIES.filter((c) => home.libraries.some((l) => l.category === c.key && l.items.length))
  const visibleLibs = filter === 'all' ? home.libraries : home.libraries.filter((l) => l.category === filter)
  const grouped = (filter === 'all' ? present : present.filter((c) => c.key === filter)).map((c) => ({
    cat: c,
    libs: visibleLibs.filter((l) => l.category === c.key && l.items.length),
  }))

  return (
    <div className="animate-fadeup">
      {featured && <Hero item={featured} name={profile?.name} />}

      {/* filtro categorie */}
      <div className="flex flex-wrap gap-2 mb-9">
        <Chip active={filter === 'all'} onClick={() => setFilter('all')} icon="grid" label="Tutto" />
        {present.map((c) => (
          <Chip key={c.key} active={filter === c.key} onClick={() => setFilter(c.key)} icon={c.icon} label={c.label} />
        ))}
      </div>

      {filter === 'all' && <ContinueRow items={cont} />}
      {filter === 'all' && <Row title="Trending Now" items={trending} icon="trending" subtitle="Aggiunti di recente al tuo cinema" />}

      {filter === 'all' && recGrid.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="flex items-center gap-2.5 text-xl md:text-2xl font-hero font-bold tracking-tight">
              <span className="text-glow drop-shadow-[0_0_10px_rgba(192,132,252,0.7)]">
                <Icon name="spark" size={22} />
              </span>
              <span className="text-white">Consigliati per te</span>
            </h2>
            <p className="mt-1 text-sm text-mute">Dalla tua libreria</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-5">
            {recGrid.map((it, i) => (
              <Card key={it.id} item={it} index={i} grid />
            ))}
          </div>
        </section>
      )}

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
        active ? 'text-white shadow-neon-sm' : 'text-brand-200/70 hover:text-white bg-white/5 hover:bg-white/10'
      }`}
      style={active ? { background: 'linear-gradient(120deg,#7B2CFF,#a855f7)' } : undefined}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )
}

function Hero({ item, name }) {
  const bg = item.hasPoster ? undefined : coverGradient(item.title)
  return (
    <div className="relative mb-10 rounded-3xl overflow-hidden ring-1 ring-brand-500/20 shadow-glow-soft grain min-h-[56vh] md:min-h-[62vh] flex items-end">
      {/* backdrop */}
      <div className="absolute inset-0" style={{ background: bg }}>
        {item.hasPoster && (
          <img src={`/api/cover/${item.id}`} alt="" className="w-full h-full object-cover scale-105" />
        )}
      </div>
      {/* overlay cinematografico */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-950/30 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glow/40 to-transparent" />

      <div className="relative p-6 md:p-12 max-w-2xl">
        <p className="text-glow/90 font-semibold tracking-widest uppercase text-xs">
          Bentornato{name ? `, ${name}` : ''} · In evidenza
        </p>
        <h1 className="font-hero text-4xl md:text-6xl font-bold mt-3 tracking-tight neon-text leading-[1.03]">
          {item.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-sm text-mute">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/15 ring-1 ring-brand-500/30 px-3 py-1 text-lilac">
            <Icon name={item.type === 'show' ? 'tv' : 'film'} size={13} /> {catLabel(item.category)}
          </span>
          {item.year && <span>{item.year}</span>}
          {item.type === 'show' && item.episodeCount != null && <span>{item.episodeCount} episodi</span>}
        </div>
        <p className="mt-4 max-w-lg text-mute leading-relaxed hidden sm:block">
          Il tuo cinema personale — anime, serie e film in streaming da qualsiasi dispositivo, in qualità straordinaria.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={`/title/${item.id}`} className="btn-primary text-base">
            <Icon name="play" size={20} /> Riproduci
          </Link>
          <Link to={`/title/${item.id}`} className="btn-secondary text-base">
            <Icon name="info" size={20} /> Dettagli
          </Link>
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <span className="w-10 h-10 rounded-full border-2 border-brand-500/30 border-t-glow animate-spinslow" />
      <span className="text-brand-200/60">Caricamento…</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="max-w-lg mx-auto text-center py-24 animate-fadeup">
      <div className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-5 animate-glow" style={{ background: 'linear-gradient(120deg,#7B2CFF,#a855f7)', boxShadow: '0 0 30px rgba(168,85,247,0.6)' }}>
        <Icon name="upload" size={34} className="text-white" />
      </div>
      <h1 className="font-hero text-2xl font-bold mb-2 neon-text">La tua libreria è vuota</h1>
      <p className="text-brand-200/60 mb-6">Crea una libreria e carica i tuoi anime, serie e film.</p>
      <Link to="/settings" className="btn-primary">
        <Icon name="plus" size={18} /> Aggiungi una libreria
      </Link>
    </div>
  )
}
