import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Dumbbell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import useAuthStore from '@/store/authStore'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
]

export default function Sidebar({ open, onToggle }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'relative h-full flex flex-col glass border-r border-border/50 transition-all duration-300 shrink-0 z-20',
        open ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/50">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 shrink-0">
          <Dumbbell className="w-5 h-5 text-primary" />
        </div>
        {open && (
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">GymPro</h1>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30"
      >
        {open ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {open && (
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'sidebar-link',
                isActive && 'active',
                !open && 'justify-center px-3'
              )
            }
            title={!open ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {open && <span className="text-sm">{label}</span>}
            {open && (
              <span
                className={cn(
                  'ml-auto w-1.5 h-1.5 rounded-full opacity-0',
                  '[.active_&]:opacity-100 [.active_&]:bg-primary'
                )}
              />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-border/50">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl mb-2',
            !open && 'justify-center px-2'
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          {open && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10',
            !open && 'justify-center px-3'
          )}
          title={!open ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {open && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
