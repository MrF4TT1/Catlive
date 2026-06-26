import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import Icon from '../components/Icon.jsx'
import { initials, accent } from '../lib/art.js'

const COLORS = ['#a855f7', '#ec4899', '#d946ef', '#7c3aed', '#22d3ee', '#f472b6', '#8b5cf6', '#f0abfc']

function Avatar({ name, color, size = 96, onClick, big }) {
  const c = color || accent(name)
  return (
    <button
      onClick={onClick}
      className="rounded-2xl flex items-center justify-center font-display font-black text-white transition-transform hover:scale-105"
      style={{
        width: size, height: size,
        fontSize: size / 2.6,
        background: `linear-gradient(135deg, ${c}, #ec4899)`,
        boxShadow: `0 0 ${big ? 28 : 16}px ${c}88`,
      }}
    >
      {initials(name)}
    </button>
  )
}

export default function Profiles() {
  const { profiles, selectProfile, setProfiles } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  const pick = (p) => { selectProfile(p); navigate('/') }
  const add = async () => {
    if (!name.trim()) return
    const p = await api.post('/profiles', { name, avatar: color })
    setProfiles([...profiles, p]); setAdding(false); setName('')
  }
  const remove = async (p) => {
    if (!confirm(`Eliminare il profilo "${p.name}"?`)) return
    try { await api.del('/profiles/' + p.id); setProfiles(profiles.filter((x) => x.id !== p.id)) } catch (e) { alert(e.message) }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8 relative">
      <div className="pointer-events-none absolute top-10 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl animate-floaty" />
      <h1 className="font-display text-3xl md:text-4xl font-black mb-12 neon-text bg-gradient-to-r from-brand-300 via-neon-pink to-brand-400 bg-clip-text text-transparent">
        Chi sta guardando?
      </h1>
      <div className="relative flex flex-wrap gap-7 justify-center max-w-2xl">
        {profiles.map((p) => (
          <div key={p.id} className="flex flex-col items-center gap-2 animate-popin">
            <Avatar name={p.name} color={/^#/.test(p.avatar || '') ? p.avatar : null} onClick={() => pick(p)} big />
            <span className="text-brand-100/80 font-semibold">{p.name}</span>
            {profiles.length > 1 && (
              <button onClick={() => remove(p)} className="text-xs text-brand-200/40 hover:text-neon-pink transition">elimina</button>
            )}
          </div>
        ))}

        {adding ? (
          <div className="flex flex-col items-center gap-3 w-44 glass rounded-2xl p-4 animate-popin">
            <div className="rounded-2xl flex items-center justify-center font-display font-black text-white" style={{ width: 64, height: 64, fontSize: 26, background: `linear-gradient(135deg, ${color}, #ec4899)`, boxShadow: `0 0 18px ${color}88` }}>
              {initials(name || '?')}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`w-5 h-5 rounded-full transition ${c === color ? 'ring-2 ring-white scale-110' : 'opacity-70'}`} style={{ background: c }} />
              ))}
            </div>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Nome" className="w-full bg-ink-800/70 rounded-lg px-2 py-1.5 text-center outline-none border border-brand-500/20 focus:border-brand-500" />
            <button onClick={add} className="btn-neon text-sm w-full py-1.5">Aggiungi</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="w-24 h-24 rounded-2xl bg-white/5 hover:bg-white/10 text-brand-300 flex items-center justify-center transition hover:scale-105 border border-brand-500/20" title="Nuovo profilo">
            <Icon name="plus" size={34} />
          </button>
        )}
      </div>
    </div>
  )
}
