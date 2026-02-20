import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import useAuthStore from '@/store/authStore'
import ProfileModal from '@/components/ProfileModal'
import { getInitials } from '@/lib/utils'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview & analytics' },
  '/members':   { title: 'Members',   subtitle: 'Manage gym members' },
  '/payments':  { title: 'Payments',  subtitle: 'Track transactions' },
}

export default function Topbar() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [profileOpen, setProfileOpen] = useState(false)

  const page = PAGE_TITLES[location.pathname] || { title: 'GymPro', subtitle: '' }

  return (
    <>
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
        {/* Page title */}
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">{page.title}</h1>
          {page.subtitle && <p className="text-xs text-muted-foreground">{page.subtitle}</p>}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
          </button>

          {/* Avatar + name — click to open profile editor */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-secondary transition-colors group"
            title="Edit profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-foreground leading-none">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{user?.role}</p>
            </div>
          </button>
        </div>
      </header>

      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
