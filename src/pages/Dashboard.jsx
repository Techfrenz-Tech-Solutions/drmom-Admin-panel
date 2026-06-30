import React, { useEffect, useState } from 'react'
import { Users, Video, Layers, DollarSign, GraduationCap, BookMarked, TrendingUp, Clock, UserCheck } from 'lucide-react'
import { loadAdminDashboard, secondsToLabel } from '../utils/adminData'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAdminDashboard()
      .then(setDashboard)
      .catch((error) => setError(error.message))
  }, [])

  const statsData = dashboard?.stats || {}
  const recentUsers = dashboard?.recentUsers || []
  const recentLessons = dashboard?.recentLessons || []

  const stats = [
    { label: 'Total Users', value: statsData.users || 0, icon: Users, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
     { label: 'Subscribed Users', value: statsData.subscribedUsers || 0, icon: UserCheck, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Active Users', value: statsData.activeUsers || 0, icon: TrendingUp, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
    { label: 'Classes', value: statsData.classes || 0, icon: GraduationCap, color: '#ff6b9d', bg: 'rgba(255,107,157,0.15)' },
    { label: 'Subjects', value: statsData.subjects || 0, icon: BookMarked, color: '#ffa94d', bg: 'rgba(255,169,77,0.15)' },
    { label: 'Chapters', value: statsData.chapters || 0, icon: Layers, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Lesson Videos', value: statsData.lessons || 0, icon: Video, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
    { label: 'Pricing Plans', value: statsData.pricingPlans || 0, icon: DollarSign, color: '#ff6b9d', bg: 'rgba(255,107,157,0.15)' },
    { label: 'Free Videos', value: statsData.freeLessons || 0, icon: Clock, color: '#ffa94d', bg: 'rgba(255,169,77,0.15)' },
  { label: 'Active Users', value: statsData.activeUsers || 0, icon: TrendingUp, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with Dr Mom 2.0</p>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-info">
              <p>{s.label}</p>
              <h3>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-tables-grid">
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: 14, color: 'var(--text)', fontSize: 15 }}>Recent Users</h3>
          <div className="table-wrap dash-table-desktop">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text)' }}>{u.name}</td>
                    <td>{u.gradeLabel || '-'}</td>
                    <td>{u.courseAccess?.[0]?.course?.title || '-'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-mobile-list">
            {recentUsers.map(u => (
              <div className="dash-mobile-row" key={u.id}>
                <div className="dash-mobile-main">
                  <span className="dash-mobile-name">{u.name}</span>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'active' : 'inactive'}</span>
                </div>
                <div className="dash-mobile-meta">
                  <span>Class: <strong>{u.gradeLabel || '-'}</strong></span>
                  <span>Plan: <strong>{u.courseAccess?.[0]?.course?.title || '-'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: 14, color: 'var(--text)', fontSize: 15 }}>Recent Videos</h3>
          <div className="table-wrap dash-table-desktop">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Class</th>
                  <th>Duration</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {recentLessons.map(v => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text)' }}>{v.title}</td>
                    <td>{v.classLabel || '-'}</td>
                    <td>{secondsToLabel(v.durationSeconds) || '-'}</td>
                    <td>
                      <span className={`badge ${v.isPreview ? 'badge-green' : 'badge-blue'}`}>
                        {v.isPreview ? 'Free' : 'Premium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="dash-mobile-list">
            {recentLessons.map(v => (
              <div className="dash-mobile-row" key={v.id}>
                <div className="dash-mobile-main">
                  <span className="dash-mobile-name">{v.title}</span>
                  <span className={`badge ${v.isPreview ? 'badge-green' : 'badge-blue'}`}>{v.isPreview ? 'Free' : 'Premium'}</span>
                </div>
                <div className="dash-mobile-meta">
                  <span>Class: <strong>{v.classLabel || '-'}</strong></span>
                  <span>Duration: <strong>{secondsToLabel(v.durationSeconds) || '-'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
