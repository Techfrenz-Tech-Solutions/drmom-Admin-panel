import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { classNames, loadAdminCatalog, subjectNames } from '../utils/adminData'

const emptyForm = { chapterCode: '', chapterName: '', className: '', courseId: '', subjectName: '' }

export default function Chapters() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(emptyForm); setEditingId(null); setError('') }

  const payload = () => ({
    code: form.chapterCode.trim(),
    title: form.chapterName.trim(),
    classLabel: form.className,
    courseId: form.courseId,
    subject: form.subjectName,
    orderIndex: editingId ? catalog.chapters.findIndex((item) => item.id === editingId) + 1 : (catalog.chapters || []).length + 1,
  })

  const handleCreate = async () => {
    if (!form.chapterCode.trim()) { setError('Chapter Code is required'); return }
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest('/admin/chapters', { method: 'POST', body: JSON.stringify(payload()) })
      setCatalog(prev => ({ ...prev, chapters: [...(prev.chapters || []), data.chapter] }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (ch) => {
    setEditingId(ch.id)
    setForm({
      chapterCode: ch.code || '',
      chapterName: ch.title,
      className: ch.classLabel || '',
      courseId: ch.courseId || '',
      subjectName: ch.subject || '',
    })
    setError('')
  }

  const handleUpdate = async () => {
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest(`/admin/chapters/${editingId}`, { method: 'PUT', body: JSON.stringify(payload()) })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.map(c => c.id === editingId ? data.chapter : c) }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/admin/chapters/${id}`, { method: 'DELETE' })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.filter(c => c.id !== id) }))
      if (editingId === id) reset()
    } catch (error) {
      setError(error.message)
    }
  }

  const classes = classNames(catalog)
  const subjects = subjectNames(catalog)
  const chapters = catalog.chapters || []
  const courses = catalog.courses || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Chapters</h1>
          <p>{chapters.length} chapters across all classes</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Code</label>
            <input className="input" placeholder="e.g. CHP-001" value={form.chapterCode} onChange={e => { set('chapterCode', e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <input className="input" placeholder="e.g. Numbers 1-10" value={form.chapterName} onChange={e => { set('chapterName', e.target.value); setError('') }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); setError('') }}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <select className="input" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <select className="input" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); setError('') }}>
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingId === null ? (
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}><Plus size={14} /> {loading ? 'Saving...' : 'Create'}</button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}><Edit2 size={14} /> {loading ? 'Saving...' : 'Update'}</button>
              <button className="btn btn-ghost" onClick={reset}>Cancel</button>
            </>
          )}
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>All Chapters</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>SI No</th>
                <th>Chapter Code</th>
                <th>Chapter Name</th>
                <th>Class Name</th>
                <th>Course Name</th>
                <th>Subject Name</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}><div className="empty-state"><Layers size={32} /><p>No chapters found. Use the form above to create one.</p></div></td></tr>
              ) : (
                chapters.map((ch, i) => (
                  <tr key={ch.id} style={{ background: editingId === ch.id ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>{ch.code || `CHP-${String(i + 1).padStart(3, '0')}`}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={14} color="var(--accent)" /><span style={{ color: 'var(--text)', fontWeight: 600 }}>{ch.title}</span></div></td>
                    <td>{ch.classLabel ? <span className="badge badge-blue">{ch.classLabel}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{ch.course?.title || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{ch.subject}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(ch)} title="Edit this chapter"><Edit2 size={13} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ch.id)} title="Delete this chapter"><Trash2 size={13} /> Delete</button>
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
