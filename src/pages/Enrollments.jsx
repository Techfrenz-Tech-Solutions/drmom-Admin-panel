import { useEffect, useState } from 'react'
import { UserCheck, Plus, Trash2, Search } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { loadAdminCatalog } from '../utils/adminData'

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([])
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ userId: '', courseId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const [enrollData, userData, catalogData] = await Promise.all([
      apiRequest('/admin/enrollments'),
      apiRequest('/admin/users'),
      loadAdminCatalog(),
    ])
    setEnrollments(enrollData.enrollments || [])
    setUsers(userData.users || [])
    setCourses(catalogData.courses || [])
  }

  useEffect(() => { load().catch(err => setError(err.message)) }, [])

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase()
    if (!q) return true
    return e.user?.name?.toLowerCase().includes(q) ||
      e.user?.email?.toLowerCase().includes(q) ||
      e.course?.title?.toLowerCase().includes(q)
  })

  const handleGrant = async () => {
    if (!form.userId || !form.courseId) { setError('Select a user and a course'); return }
    setLoading(true)
    setError('')
    try {
      await apiRequest('/admin/enrollments', {
        method: 'POST',
        body: JSON.stringify({ userId: form.userId, courseId: form.courseId }),
      })
      setForm({ userId: '', courseId: '' })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (id) => {
    try {
      await apiRequest(`/admin/enrollments/${id}`, { method: 'DELETE' })
      setEnrollments(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Enrollments</h1>
          <p>{enrollments.length} total enrollments</p>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      {/* Grant form */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 14, marginBottom: 14 }}>
          Grant Manual Enrollment
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 14, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">User</label>
            <select className="input" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
              <option value="">— Select User —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course</label>
            <select className="input" value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}>
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleGrant} disabled={loading}>
            <Plus size={14} /> {loading ? 'Granting...' : 'Grant Access'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <div className="search-bar">
          <Search size={14} color="var(--text3)" />
          <input placeholder="Search user or course..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><UserCheck size={36} /><p>No enrollments found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Course</th>
                  <th>Source</th>
                  <th>Granted</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{e.user?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.user?.email}</div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{e.course?.title || '—'}</td>
                    <td>
                      <span className={`badge ${e.source === 'MANUAL' ? 'badge-yellow' : e.source === 'PURCHASE' ? 'badge-green' : 'badge-blue'}`}>
                        {e.source}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(e.grantedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRevoke(e.id)}
                        title="Revoke enrollment"
                      >
                        <Trash2 size={13} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
