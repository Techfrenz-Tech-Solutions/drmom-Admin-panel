import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, Mail, Lock, Shield, LogOut, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { logoutAdmin } from '../utils/api'
import './AdminProfile.css'

export default function AdminProfile({ onClose }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saved, setSaved] = useState(false)

  const [profile, setProfile] = useState({
    name: localStorage.getItem('adminName') || 'Admin',
    email: localStorage.getItem('adminEmail') || 'admin@drmom.local',
  })
  const [pw, setPw] = useState({ old: '', new: '', confirm: '' })
  const [pwError, setPwError] = useState('')

  const handleProfileSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePwSave = () => {
    if (!pw.old) { setPwError('Enter your current password'); return }
    if (pw.new.length < 6) { setPwError('New password must be at least 6 characters'); return }
    if (pw.new !== pw.confirm) { setPwError('Passwords do not match'); return }
    setPwError('')
    setPw({ old: '', new: '', confirm: '' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSignOut = async () => {
    try {
      await logoutAdmin()
    } catch (error) {
      // local state still needs clearing if the server session is already gone
    }
    localStorage.removeItem('authToken')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    navigate('/login')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal">

        {/* Header */}
        <div className="ap-header">
          <div className="ap-header-info">
            <div className="ap-avatar-lg">A</div>
            <div>
              <div className="ap-name">{profile.name}</div>
              <div className="ap-role"><Shield size={11} /> Super Admin</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        {/* Tabs */}
        <div className="ap-tabs">
          <button className={`ap-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            <User size={14} /> Profile
          </button>
          <button className={`ap-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            <Lock size={14} /> Password
          </button>
        </div>

        {/* Body */}
        <div className="ap-body">

          {tab === 'profile' && (
            <div className="ap-section">
              <div className="form-group">
                <label className="form-label"><User size={12} /> Display Name</label>
                <input
                  className="input"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  placeholder="Admin name"
                />
              </div>
              <div className="form-group">
                <label className="form-label"><Mail size={12} /> Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  placeholder="admin@drmom.in"
                />
              </div>

              <div className="ap-info-card">
                <div className="ap-info-row">
                  <span className="ap-info-label">Role</span>
                  <span className="ap-info-val ap-badge-accent">Super Admin</span>
                </div>
                <div className="ap-info-row">
                  <span className="ap-info-label">Status</span>
                  <span className="ap-info-val ap-badge-green">Active</span>
                </div>
                <div className="ap-info-row">
                  <span className="ap-info-label">Last Login</span>
                  <span className="ap-info-val">Today</span>
                </div>
              </div>

              <div className="ap-actions">
                {saved && <span className="ap-saved"><CheckCircle size={13} /> Saved</span>}
                <button className="btn btn-primary" onClick={handleProfileSave}>Save Changes</button>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="ap-section">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <div className="ap-pw-wrap">
                  <input
                    className="input"
                    type={showOld ? 'text' : 'password'}
                    value={pw.old}
                    onChange={e => { setPw(p => ({ ...p, old: e.target.value })); setPwError('') }}
                    placeholder="Enter current password"
                  />
                  <button className="ap-eye" onClick={() => setShowOld(v => !v)}>
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
            ccc     </div>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="ap-pw-wrap">
                  <input
                    className="input"
                    type={showNew ? 'text' : 'password'}
                    value={pw.new}
                    onChange={e => { setPw(p => ({ ...p, new: e.target.value })); setPwError('') }}
                    placeholder="Min. 6 characters"
                  />
                  <button className="ap-eye" onClick={() => setShowNew(v => !v)}>
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="ap-pw-wrap">
                  <input
                    className="input"
                    type={showConfirm ? 'text' : 'password'}
                    value={pw.confirm}
                    onChange={e => { setPw(p => ({ ...p, confirm: e.target.value })); setPwError('') }}
                    placeholder="Repeat new password"
                  />
                  <button className="ap-eye" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              {pwError && <p className="ap-error">{pwError}</p>}

              <div className="ap-actions">
                {saved && <span className="ap-saved"><CheckCircle size={13} /> Password updated</span>}
                <button className="btn btn-primary" onClick={handlePwSave}>Update Password</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ap-footer">
          <button className="ap-logout" onClick={handleSignOut}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
