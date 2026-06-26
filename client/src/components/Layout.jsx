import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div className="min-h-full relative overflow-x-hidden">
      {/* glow decorativi animati di sfondo */}
      <div className="pointer-events-none fixed -top-32 -left-32 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl animate-floaty" />
      <div className="pointer-events-none fixed top-1/3 -right-40 w-96 h-96 rounded-full bg-neon-pink/15 blur-3xl animate-floaty" style={{ animationDelay: '1.5s' }} />
      <Navbar />
      <main className="relative px-4 md:px-10 pb-24 pt-24">
        <Outlet />
      </main>
    </div>
  )
}
