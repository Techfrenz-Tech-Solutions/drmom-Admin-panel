import { useState } from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import './Topbar.css'
import AdminProfile from './AdminProfile'

export default function Topbar({ onMenuClick, title }) {
  const [showProfile, setShowProfile] = useState(false)

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button className="menu-btn" onClick={onMenuClick}>
            <Menu size={20} />
          </button>
          <span className="topbar-title">{title}</span>
        </div>
        <div className="topbar-right">
          <button className="topbar-icon-btn">
            <Bell size={17} />
            <span className="notif-dot" />
          </button>
          <div className="topbar-avatar" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>A</div>
        </div>
      </header>

      {showProfile && <AdminProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}
