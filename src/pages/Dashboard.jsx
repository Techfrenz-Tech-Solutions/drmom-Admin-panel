import React from 'react'
import { useApp } from '../context/AppContext'
import { Users, Video, Layers, DollarSign, GraduationCap, BookMarked, TrendingUp, Clock } from 'lucide-react'

export default function Dashboard() {
  const { data } = useApp()

  const stats = [
    { label: 'Total Users', value: data.users.length, icon: Users, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Active Users', value: data.users.filter(u => u.status === 'active').length, icon: TrendingUp, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
    { label: 'Classes', value: data.classes.length, icon: GraduationCap, color: '#ff6b9d', bg: 'rgba(255,107,157,0.15)' },
    { label: 'Subjects', value: data.subjects.length, icon: BookMarked, color: '#ffa94d', bg: 'rgba(255,169,77,0.15)' },
    { label: 'Chapters', value: data.chapters.length, icon: Layers, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Lesson Videos', value: data.videos.length, icon: Video, color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' },
    { label: 'Pricing Plans', value: data.prices.length, icon: DollarSign, color: '#ff6b9d', bg: 'rgba(255,107,157,0.15)' },
    { label: 'Free Videos', value: data.videos.filter(v => v.free).length, icon: Clock, color: '#ffa94d', bg: 'rgba(255,169,77,0.15)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening with Dr Mom 2.0</p>
        </div>
      </div>

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

          {/* Desktop table */}
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
                {data.users.slice(0, 5).map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text)' }}>{u.name}</td>
                    <td>{u.class}</td>
                    <td>{u.plan}</td>
                    <td>
                      <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="dash-mobile-list">
            {data.users.slice(0, 5).map(u => (
              <div className="dash-mobile-row" key={u.id}>
                <div className="dash-mobile-main">
                  <span className="dash-mobile-name">{u.name}</span>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
                </div>
                <div className="dash-mobile-meta">
                  <span>Class: <strong>{u.class}</strong></span>
                  <span>Plan: <strong>{u.plan}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: 14, color: 'var(--text)', fontSize: 15 }}>Recent Videos</h3>

          {/* Desktop table */}
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
                {data.videos.slice(0, 5).map(v => (
                  <tr key={v.id}>
                    <td style={{ color: 'var(--text)' }}>{v.title}</td>
                    <td>{v.class}</td>
                    <td>{v.duration}</td>
                    <td>
                      <span className={`badge ${v.free ? 'badge-green' : 'badge-blue'}`}>
                        {v.free ? 'Free' : 'Premium'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="dash-mobile-list">
            {data.videos.slice(0, 5).map(v => (
              <div className="dash-mobile-row" key={v.id}>
                <div className="dash-mobile-main">
                  <span className="dash-mobile-name">{v.title}</span>
                  <span className={`badge ${v.free ? 'badge-green' : 'badge-blue'}`}>{v.free ? 'Free' : 'Premium'}</span>
                </div>
                <div className="dash-mobile-meta">
                  <span>Class: <strong>{v.class}</strong></span>
                  <span>Duration: <strong>{v.duration}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
