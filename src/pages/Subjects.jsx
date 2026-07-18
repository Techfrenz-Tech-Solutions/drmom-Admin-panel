import { useEffect, useRef, useState } from 'react'
import { BookMarked, Plus, Edit2, Trash2, ImagePlus, X } from 'lucide-react'
import { apiRequest, API_BASE_URL } from '../utils/api'
import { classNames, loadAdminCatalog } from '../utils/adminData'

const EMPTY = { subjectCode: '', subjectName: '', className: '', imageFile: null, imagePreview: '' }

export default function Subjects() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [] })
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const imageInputRef = useRef(null)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_BASE_URL}/admin/upload`, { method: 'POST', credentials: 'include', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Image upload failed')
    return data.url || data.fileUrl || data.path || null
  }

  const payload = (imageUrl) => ({
    code: form.subjectCode.trim(),
    name: form.subjectName.trim(),
    classLabel: form.className,
    ...(imageUrl !== undefined && { imageUrl }),
  })

  const handleCreate = async () => {
    if (!form.subjectCode.trim()) { setError('Subject Code is required'); return }
    if (!form.subjectName.trim()) { setError('Subject Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      let imageUrl
      if (form.imageFile) imageUrl = await uploadImage(form.imageFile)
      const data = await apiRequest('/admin/subjects', { method: 'POST', body: JSON.stringify(payload(imageUrl)) })
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
    setForm({ subjectCode: subject.code || '', subjectName: subject.name, className: subject.classLabel || '', imageFile: null, imagePreview: subject.imageUrl || '' })
    setError('')
  }

  const handleUpdate = async () => {
    if (!form.subjectName.trim()) { setError('Subject Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      let imageUrl
      if (form.imageFile) imageUrl = await uploadImage(form.imageFile)
      const data = await apiRequest(`/admin/subjects/${editingId}`, { method: 'PUT', body: JSON.stringify(payload(imageUrl)) })
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Code</label>
            <input className="input" placeholder="e.g. SUB-001" value={form.subjectCode} onChange={e => { set('subjectCode', e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <input className="input" placeholder="e.g. Mathematics" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && (editingId === null ? handleCreate() : handleUpdate())} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); setError('') }}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* ── Upload Picture ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Subject Picture</label>
          <div
            style={{
              border: '2px dashed var(--border)', borderRadius: 10, padding: '18px 14px',
              textAlign: 'center', cursor: 'pointer',
              background: (form.imageFile || form.imagePreview) ? 'rgba(108,99,255,0.06)' : 'transparent',
              transition: 'background 0.2s',
            }}
            onClick={() => imageInputRef.current?.click()}
          >
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0] || null
                set('imageFile', file)
                set('imagePreview', file ? URL.createObjectURL(file) : form.imagePreview)
                e.target.value = ''
              }}
            />
            {form.imagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <img src={form.imagePreview} alt="preview" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                  {form.imageFile ? form.imageFile.name : 'Current image'}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                  onClick={e => { e.stopPropagation(); set('imageFile', null); set('imagePreview', '') }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <ImagePlus size={26} color="var(--text3)" style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload subject picture<br /><span style={{ fontSize: 11 }}>PNG, JPG, WEBP etc.</span></p>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
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
