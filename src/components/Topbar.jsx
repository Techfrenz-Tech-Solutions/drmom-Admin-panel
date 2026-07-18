import { useState } from 'react'
import { Menu, Bell } from 'lucide-react'
import './Topbar.css'
import AdminProfile from './AdminProfile'

export default function Topbar({ onMenuClick, onCollapseClick, title }) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          {/* Desktop: collapse/expand sidebar labels */}
          <button className="menu-btn menu-btn-desktop" onClick={onCollapseClick} title="Toggle sidebar">
            <Menu size={20} />
          </button>
          {/* Mobile: open sidebar overlay */}
          <button className="menu-btn menu-btn-mobile" onClick={onMenuClick} title="Open menu">
            <Menu size={20} />
          </button>
          <span className="topbar-title">{title}</span>
        </div>
        <div className="topbar-right">
          <button className="topbar-icon-btn">
            <Bell size={17} />
            <span className="notif-dot" />
          </button>
          <div className="topbar-avatar" onClick={() => setShowProfile(true)}>A</div>
        </div>
      </header>

      {showProfile && <AdminProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}
