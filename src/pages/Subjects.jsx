import { useEffect, useState } from 'react'
import { BookMarked, Plus, Edit2, Trash2 } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { classNames, loadAdminCatalog } from '../utils/adminData'

const EMPTY = { subjectCode: '', subjectName: '', className: '' }

export default function Subjects() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [] })
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  const payload = () => ({
    code: form.subjectCode.trim(),
    name: form.subjectName.trim(),
    classLabel: form.className,
  })

  const handleCreate = async () => {
    if (!form.subjectCode.trim()) { setError('Subject Code is required'); return }
    if (!form.subjectName.trim()) { setError('Subject Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest('/admin/subjects', { method: 'POST', body: JSON.stringify(payload()) })
      setCatalog(prev => ({ ...prev, subjects: [...(prev.subjects || []), data.subject] }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (subject) => {
    setEditingId(subject.id)
    setForm({ subjectCode: subject.code || '', subjectName: subject.name, className: subject.classLabel || '' })
    setError('')
  }

  const handleUpdate = async () => {
    if (!form.subjectName.trim()) { setError('Subject Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest(`/admin/subjects/${editingId}`, { method: 'PUT', body: JSON.stringify(payload()) })
      setCatalog(prev => ({ ...prev, subjects: prev.subjects.map(s => s.id === editingId ? data.subject : s) }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/admin/subjects/${id}`, { method: 'DELETE' })
      setCatalog(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== id) }))
      if (editingId === id) reset()
    } catch (error) {
      setError(error.message)
    }
  }

  const classes = classNames(catalog)
  const subjects = catalog.subjects || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Manage all subjects available in the platform</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
            <label className="form-label">Subject Code</label>
            <input className="input" placeholder="e.g. SUB-001" value={form.subjectCode} onChange={e => { set('subjectCode', e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <input className="input" placeholder="e.g. Mathematics" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && (editingId === null ? handleCreate() : handleUpdate())} />
          </div>
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); setError('') }}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
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
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>All Subjects</h3>
        {subjects.length === 0 ? (
          <div className="empty-state"><BookMarked size={36} /><p>No subjects found. Use the form above to create one.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>SI No</th>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Class Name</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr key={s.id} style={{ background: editingId === s.id ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{s.code || `SUB-${String(i + 1).padStart(3, '0')}`}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BookMarked size={14} color="var(--accent)" /><span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.name}</span></div></td>
                    <td>{s.classLabel ? <span className="badge badge-blue">{s.classLabel}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(s)} title="Edit this subject"><Edit2 size={13} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)} title="Delete this subject"><Trash2 size={13} /> Delete</button>
                      </div>
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
