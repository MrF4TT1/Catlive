import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function Layout() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="px-4 md:px-10 pb-24 pt-24">
        <Outlet />
      </main>
    </div>
  )
}
