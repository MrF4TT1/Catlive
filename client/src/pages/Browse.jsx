import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Row from '../components/Row.jsx'

export default function Browse() {
  const { profile } = useAuth()
  const [home, setHome] = useState(null)
  const [cont, setCont] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/media/home').then(setHome).catch((e) => setError(e.message))
    if (profile) {
      api.get('/progress/continue?profileId=' + profile.id).then(setCont).catch(() => {})
    }
  }, [profile])

  if (error) return <p className="text-zinc-400">{error}</p>
  if (!home) return <p className="text-zinc-400">Caricamento…</p>

  const isEmpty = home.libraries.every((l) => l.items.length === 0)
  if (isEmpty) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-4">🍿</div>
        <h1 className="text-2xl font-bold mb-2">La tua libreria è vuota</h1>
        <p className="text-zinc-400 mb-6">
          Aggiungi una cartella con i tuoi film o serie TV per iniziare a guardare.
        </p>
        <Link to="/settings" className="bg-brand-600 hover:bg-brand-500 px-5 py-2.5 rounded-md font-semibold">
          Aggiungi una libreria
        </Link>
      </div>
    )
  }

  const continueItems = cont.map((p) => ({
    id: p.parentId,
    title: p.title,
    type: p.type,
    _progress: p.duration ? Math.round((p.position / p.duration) * 100) : 0,
  }))

  return (
    <div>
      <Row title="Continua a guardare" items={continueItems} />
      <Row title="Aggiunti di recente" items={home.recent} />
      {home.libraries.map((l) => (
        <Row key={l.id} title={l.name} items={l.items} />
      ))}
    </div>
  )
}
