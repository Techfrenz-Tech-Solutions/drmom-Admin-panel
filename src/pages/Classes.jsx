import { useEffect, useState } from 'react'
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { loadAdminCatalog } from '../utils/adminData'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [classCode, setClassCode] = useState('')
  const [className, setClassName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    const data = await loadAdminCatalog()
    setClasses(data.classes || [])
  }

  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const reset = () => {
    setClassCode('')
    setClassName('')
    setEditingId(null)
    setError('')
  }

  const payload = () => ({
    code: classCode.trim(),
    name: className.trim(),
    orderIndex: editingId ? classes.findIndex((item) => item.id === editingId) + 1 : classes.length + 1,
  })

  const handleCreate = async () => {
    if (!classCode.trim()) { setError('Class Code is required'); return }
    if (!className.trim()) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest('/admin/classes', { method: 'POST', body: JSON.stringify(payload()) })
      setClasses((prev) => [...prev, data.classLevel])
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (item) => {
    setEditingId(item.id)
    setClassCode(item.code || '')
    setClassName(item.name)
    setError('')
  }

  const handleUpdate = async () => {
    if (!className.trim()) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest(`/admin/classes/${editingId}`, { method: 'PUT', body: JSON.stringify(payload()) })
      setClasses((prev) => prev.map((item) => item.id === editingId ? data.classLevel : item))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/admin/classes/${id}`, { method: 'DELETE' })
      setClasses((prev) => prev.filter((item) => item.id !== id))
      if (editingId === id) reset()
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>Manage class levels used by courses, chapters, videos, pricing and users</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
            <label className="form-label">Class Code</label>
            <input className="input" placeholder="e.g. CLS-001" value={classCode} onChange={e => { setClassCode(e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <input className="input" placeholder="e.g. Grade 1" value={className} onChange={e => { setClassName(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && (editingId === null ? handleCreate() : handleUpdate())} />
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 0, alignItems: 'flex-end' }}>
            {editingId === null ? (
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading}><Plus size={14} /> {loading ? 'Saving...' : 'Create'}</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}><Edit2 size={14} /> {loading ? 'Saving...' : 'Update'}</button>
                <button className="btn btn-ghost" onClick={reset}>Cancel</button>
              </>
            )}
          </div>
        </div>
        {error && <div style={{ marginTop: 10, color: 'var(--red)', fontSize: 13 }}>{error}</div>}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>All Classes</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>SI No</th>
                <th>Class Code</th>
                <th>Class Name</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>No classes found. Use the form above to create one.</td></tr>
              ) : (
                classes.map((cls, i) => (
                  <tr key={cls.id} style={{ background: editingId === cls.id ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{cls.code || `CLS-${String(i + 1).padStart(3, '0')}`}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={14} color="var(--accent)" /><span style={{ color: 'var(--text)', fontWeight: 600 }}>{cls.name}</span></div></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(cls)} title="Edit this class"><Edit2 size={13} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cls.id)} title="Delete this class"><Trash2 size={13} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
