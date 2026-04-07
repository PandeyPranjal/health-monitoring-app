import { Outlet } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

export default function MobileLayout({ title, subtitle }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <Header title={title} subtitle={subtitle} />

      {/* Scrollable content area */}
      <main className="flex-1 px-5 pt-2 pb-24 overflow-y-auto animate-fade-in">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
