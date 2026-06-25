import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

const AVATARS = ['🐱', '🦁', '🐯', '🐰', '🐼', '🦊', '🐶', '🐸', '🐵', '🐨']

export default function Profiles() {
  const { profiles, selectProfile, setProfiles } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('🐱')

  const pick = (p) => {
    selectProfile(p)
    navigate('/')
  }

  const add = async () => {
    if (!name.trim()) return
    const p = await api.post('/profiles', { name, avatar })
    setProfiles([...profiles, p])
    setAdding(false)
    setName('')
  }

  const remove = async (p) => {
    if (!confirm(`Eliminare il profilo "${p.name}"?`)) return
    try {
      await api.del('/profiles/' + p.id)
      setProfiles(profiles.filter((x) => x.id !== p.id))
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-10">Chi sta guardando?</h1>
      <div className="flex flex-wrap gap-6 justify-center max-w-2xl">
        {profiles.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-2">
            <button
              onClick={() => pick(p)}
              className="w-24 h-24 rounded-xl bg-white/10 hover:ring-2 ring-brand-500 text-5xl flex items-center justify-center transition"
            >
              {p.avatar}
            </button>
            <span className="text-zinc-300">{p.name}</span>
            {profiles.length > 1 && (
              <button onClick={() => remove(p)} className="text-xs text-zinc-600 hover:text-red-400">
                elimina
              </button>
            )}
          </div>
        ))}

        {adding ? (
          <div className="flex flex-col items-center gap-2 w-40">
            <div className="grid grid-cols-5 gap-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-2xl ${a === avatar ? 'opacity-100 scale-110' : 'opacity-40'}`}
                >
                  {a}
                </button>
              ))}
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              placeholder="Nome"
              className="w-full bg-white/10 rounded px-2 py-1 text-center outline-none"
            />
            <button onClick={add} className="bg-brand-600 hover:bg-brand-500 px-3 py-1 rounded text-sm">
              Aggiungi
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-24 h-24 rounded-xl bg-white/5 hover:bg-white/10 text-4xl text-zinc-500 flex items-center justify-center"
            title="Aggiungi profilo"
          >
            ＋
          </button>
        )}
      </div>
    </div>
  )
}
