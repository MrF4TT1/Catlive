import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [profile, setProfile] = useState(null)
  const [demo, setDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    api
      .get('/auth/status')
      .then((s) => setDemo(!!s.demo))
      .catch(() => {})
    try {
      const me = await api.get('/auth/me')
      setUser(me.user)
      setProfiles(me.profiles)
      const savedId = localStorage.getItem('cat_profile')
      const found = me.profiles.find((p) => p.id === savedId) || null
      setProfile(found)
    } catch {
      setUser(null)
      setProfiles([])
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const selectProfile = (p) => {
    setProfile(p)
    localStorage.setItem('cat_profile', p.id)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      /* ignora */
    }
    setUser(null)
    setProfile(null)
    setProfiles([])
    localStorage.removeItem('cat_profile')
  }

  return (
    <AuthContext.Provider
      value={{ user, profiles, profile, demo, loading, refresh, selectProfile, setProfiles, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
