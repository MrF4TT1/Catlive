import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Setup from './pages/Setup.jsx'
import Login from './pages/Login.jsx'
import Landing from './pages/Landing.jsx'
import Profiles from './pages/Profiles.jsx'
import Browse from './pages/Browse.jsx'
import Search from './pages/Search.jsx'
import Title from './pages/Title.jsx'
import Player from './pages/Player.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div className="flex h-full items-center justify-center text-zinc-400">Caricamento…</div>
  }

  // Non autenticato
  if (!user) {
    return (
      <Routes>
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Autenticato ma nessun profilo selezionato
  if (!profile) {
    return (
      <Routes>
        <Route path="*" element={<Profiles />} />
      </Routes>
    )
  }

  // Sessione completa
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Browse />} />
        <Route path="/search" element={<Search />} />
        <Route path="/title/:id" element={<Title />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profiles" element={<Profiles />} />
      </Route>
      <Route path="/watch/:id" element={<Player />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
