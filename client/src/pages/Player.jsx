import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from '../components/Icon.jsx'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get('parent') || id
  const restart = searchParams.get('restart') === '1'
  const videoRef = useRef(null)
  const nextIdRef = useRef(null)
  const [warn, setWarn] = useState('')
  const [loading, setLoading] = useState(true)

  // Trova il prossimo episodio (per l'autoplay a fine episodio).
  useEffect(() => {
    nextIdRef.current = null
    if (!parentId || parentId === id) return
    api.get('/media/' + parentId).then((d) => {
      if (d.type !== 'show' || !d.episodes) return
      const idx = d.episodes.findIndex((e) => e.id === id)
      if (idx >= 0 && idx + 1 < d.episodes.length) nextIdRef.current = d.episodes[idx + 1].id
    }).catch(() => {})
  }, [id, parentId])

  // Riprendi dalla posizione salvata (a meno di "da capo").
  useEffect(() => {
    if (!profile || restart) return
    api.get('/progress?profileId=' + profile.id).then((list) => {
      const rec = list.find((p) => p.playableId === id)
      const v = videoRef.current
      if (rec && v && rec.position > 5) {
        const apply = () => { v.currentTime = rec.position }
        if (v.readyState >= 1) apply()
        else v.addEventListener('loadedmetadata', apply, { once: true })
      }
    }).catch(() => {})
  }, [id, profile, restart])

  // Salvataggio periodico dello stato di visione.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !profile) return
    let last = 0
    const save = (finished) =>
      api.post('/progress', {
        profileId: profile.id, playableId: id, parentId,
        position: v.currentTime, duration: v.duration || 0, finished,
      }).catch(() => {})
    const onTime = () => { if (v.currentTime - last >= 5) { last = v.currentTime; save(false) } }
    const onEnded = () => {
      save(true)
      if (nextIdRef.current) navigate(`/watch/${nextIdRef.current}?parent=${parentId}`)
    }
    const onError = () => setWarn('Impossibile riprodurre questo file nel browser (formati come .mkv/.avi richiedono transcodifica).')
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', onError)
    return () => {
      if (v.duration) save(false)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', onError)
    }
  }, [id, parentId, profile])

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition hover:scale-110"
        style={{ background: 'rgba(124,58,237,0.5)', boxShadow: '0 0 16px rgba(168,85,247,0.6)' }}
        title="Indietro"
      >
        <Icon name="back" size={22} />
      </button>
      {warn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-sm px-4 py-2 rounded-xl max-w-md text-center text-white" style={{ background: 'linear-gradient(120deg,#9333ea,#ec4899)' }}>
          {warn}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="w-12 h-12 rounded-full border-2 border-brand-500/30 border-t-neon-pink animate-spinslow" />
        </div>
      )}
      <video
        key={id}
        ref={videoRef}
        src={'/api/stream/' + id}
        controls
        autoPlay
        onCanPlay={() => setLoading(false)}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
