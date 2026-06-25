import { useEffect, useState } from 'react'
import { api } from '../api.js'
import Card from '../components/Card.jsx'

export default function Search() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      const path = '/media' + (q ? '?search=' + encodeURIComponent(q) : '')
      api
        .get(path)
        .then((r) => {
          setResults(r)
          setLoaded(true)
        })
        .catch(() => {})
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca film e serie TV…"
        className="w-full bg-white/10 rounded-md px-4 py-3 mb-6 outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 justify-items-center">
        {results.map((it) => (
          <Card key={it.id} item={it} />
        ))}
      </div>
      {loaded && results.length === 0 && (
        <p className="text-zinc-500 mt-4">Nessun risultato.</p>
      )}
    </div>
  )
}
