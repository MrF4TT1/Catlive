import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Player() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [searchParams] = useSearchParams()
  const parentId = searchParams.get('parent') || id
  const videoRef = useRef(null)
  const [warn, setWarn] = useState('')

  // Riprendi dalla posizione salvata.
  useEffect(() => {
    if (!profile) return
    api
      .get('/progress?profileId=' + profile.id)
      .then((list) => {
        const rec = list.find((p) => p.playableId === id)
        const v = videoRef.current
        if (rec && v && rec.position > 5) {
          const apply = () => {
            v.currentTime = rec.position
          }
          if (v.readyState >= 1) apply()
          else v.addEventListener('loadedmetadata', apply, { once: true })
        }
      })
      .catch(() => {})
  }, [id, profile])

  // Salvataggio periodico dello stato di visione.
  useEffect(() => {
    const v = videoRef.current
    if (!v || !profile) return

    let last = 0
    const save = (finished) =>
      api
        .post('/progress', {
          profileId: profile.id,
          playableId: id,
          parentId,
          position: v.currentTime,
          duration: v.duration || 0,
          finished,
        })
        .catch(() => {})

    const onTime = () => {
      if (v.currentTime - last >= 5) {
        last = v.currentTime
        save(false)
      }
    }
    const onEnded = () => save(true)
    const onError = () =>
      setWarn(
        'Impossibile riprodurre questo file nel browser. Formati come .mkv o .avi spesso richiedono la transcodifica (non ancora supportata).'
      )

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
        className="absolute top-4 left-4 z-10 text-white/90 hover:text-white bg-black/50 hover:bg-black/70 rounded-full w-11 h-11 text-xl"
        title="Indietro"
      >
        ←
      </button>
      {warn && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-brand-600 text-sm px-4 py-2 rounded-md max-w-md text-center">
          {warn}
        </div>
      )}
      <video
        ref={videoRef}
        src={'/api/stream/' + id}
        controls
        autoPlay
        className="w-full h-full object-contain"
      />
    </div>
  )
}
