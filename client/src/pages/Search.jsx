import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Card from '../components/Card.jsx'
import Icon from '../components/Icon.jsx'
import { CATEGORIES } from '../lib/categories.js'

export default function Search() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const [results, setResults] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const params = []
      if (q) params.push('search=' + encodeURIComponent(q))
      if (cat !== 'all') params.push('category=' + cat)
      api.get('/media' + (params.length ? '?' + params.join('&') : '')).then((r) => {
        setResults(r); setLoaded(true)
      }).catch(() => {})
    }, 220)
    return () => clearTimeout(t)
  }, [q, cat])

  return (
    <div className="animate-fadeup">
      <div className="relative mb-5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400">
          <Icon name="search" size={20} />
        </span>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cerca anime, serie e film…"
          className="w-full bg-ink-800/70 rounded-2xl pl-12 pr-4 py-3.5 outline-none border border-brand-500/20 focus:border-brand-500 focus:shadow-neon-sm transition text-lg"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-7">
        {[{ key: 'all', label: 'Tutto', icon: 'grid' }, ...CATEGORIES].map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${cat === c.key ? 'text-white shadow-neon-sm' : 'text-brand-200/70 bg-white/5 hover:bg-white/10'}`}
            style={cat === c.key ? { background: 'linear-gradient(120deg,#9333ea,#ec4899)' } : undefined}
          >
            <Icon name={c.icon} size={15} /> {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-5 justify-items-center">
        {results.map((it, i) => (
          <Card key={it.id} item={it} index={i} />
        ))}
      </div>
      {loaded && results.length === 0 && <p className="text-brand-200/50 mt-6 text-center">Nessun risultato.</p>}
    </div>
  )
}
