import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Layers, BookMarked,
  DollarSign, Users, ChevronRight, GraduationCap,
  ShoppingCart, UserCheck, TrendingUp, Wallet, Mail, HardDrive,
} from 'lucide-react'
import './Sidebar.css'
import Logo from '../Assets/Logo.png'
import AdminProfile from './AdminProfile'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classes', icon: GraduationCap, label: 'Classes' },
  { to: '/subjects', icon: BookMarked, label: 'Subjects' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/chapters', icon: Layers, label: 'Chapters' },
  { to: '/prices', icon: DollarSign, label: 'Pricing' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/enrollments', icon: UserCheck, label: 'Enrollments' },
  { to: '/student-progress', icon: TrendingUp, label: 'Student Progress' },
  { to: '/payment-tracker', icon: Wallet, label: 'Payment Tracker' },
  { to: '/newsletter', icon: Mail, label: 'Newsletter' },
  { to: '/storage', icon: HardDrive, label: 'Storage' },
]

export default function Sidebar({ open, collapsed, onClose }) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      {open && <div className="sb-overlay" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>

        {/* Brand */}
        <div className="sb-brand">
          <img src={Logo} alt="Dr Mom Logo" className="sb-logo-img" />
          {!collapsed && (
            <div className="sb-brand-text">
              <div className="sb-title">Dr Mom 2.0</div>
              <div className="sb-sub">Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {!collapsed && <div className="sb-section-label">Main</div>}
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
              title={collapsed ? label : undefined}
            >
              <Icon size={17} className="sb-icon" />
              {!collapsed && <span className="sb-label">{label}</span>}
              {!collapsed && <ChevronRight size={13} className="sb-arrow" />}
            </NavLink>
          ))}
        </nav>
      </aside>

      {showProfile && <AdminProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}
