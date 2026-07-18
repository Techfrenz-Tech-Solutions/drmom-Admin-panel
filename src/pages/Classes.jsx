import { useEffect, useRef, useState } from 'react'
import { GraduationCap, Plus, Edit2, Trash2, ImagePlus, X } from 'lucide-react'
import { apiRequest, API_BASE_URL } from '../utils/api'
import { loadAdminCatalog } from '../utils/adminData'

export default function Classes() {
  const [classes, setClasses] = useState([])
  const [classCode, setClassCode] = useState('')
  const [className, setClassName] = useState('')
  const [classImage, setClassImage] = useState(null)       // File object
  const [classImagePreview, setClassImagePreview] = useState('')  // existing URL when editing
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const imageInputRef = useRef(null)

  const load = async () => {
    const data = await loadAdminCatalog()
    setClasses(data.classes || [])
  }

  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const reset = () => {
    setClassCode('')
    setClassName('')
    setClassImage(null)
    setClassImagePreview('')
    setEditingId(null)
    setError('')
  }

  const uploadImage = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${API_BASE_URL}/admin/upload`, { method: 'POST', credentials: 'include', body: fd })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Image upload failed')
    return data.url || data.fileUrl || data.path || null
  }

  const payload = (imageUrl) => ({
    code: classCode.trim(),
    name: className.trim(),
    ...(imageUrl !== undefined && { imageUrl }),
    orderIndex: editingId ? classes.findIndex((item) => item.id === editingId) + 1 : classes.length + 1,
  })

  const handleCreate = async () => {
    if (!classCode.trim()) { setError('Class Code is required'); return }
    if (!className.trim()) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      let imageUrl
      if (classImage) imageUrl = await uploadImage(classImage)
      const data = await apiRequest('/admin/classes', { method: 'POST', body: JSON.stringify(payload(imageUrl)) })
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
    setClassImage(null)
    setClassImagePreview(item.imageUrl || '')
    setError('')
  }

  const handleUpdate = async () => {
    if (!className.trim()) { setError('Class Name is required'); return }
    setLoading(true)
    try {
      let imageUrl
      if (classImage) imageUrl = await uploadImage(classImage)
      const data = await apiRequest(`/admin/classes/${editingId}`, { method: 'PUT', body: JSON.stringify(payload(imageUrl)) })
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Code</label>
            <input className="input" placeholder="e.g. CLS-001" value={classCode} onChange={e => { setClassCode(e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <input className="input" placeholder="e.g. Grade 1" value={className} onChange={e => { setClassName(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && (editingId === null ? handleCreate() : handleUpdate())} />
          </div>
        </div>

        {/* ── Upload Picture ── */}
        <div style={{ marginBottom: 14 }}>
          <label className="form-label">Class Picture</label>
          <div
            style={{
              border: '2px dashed var(--border)', borderRadius: 10, padding: '18px 14px',
              textAlign: 'center', cursor: 'pointer',
              background: (classImage || classImagePreview) ? 'rgba(108,99,255,0.06)' : 'transparent',
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
                setClassImage(file)
                if (file) setClassImagePreview(URL.createObjectURL(file))
                e.target.value = ''
              }}
            />
            {classImagePreview ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <img src={classImagePreview} alt="preview" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>
                  {classImage ? classImage.name : 'Current image'}
                </span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                  onClick={e => { e.stopPropagation(); setClassImage(null); setClassImagePreview('') }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <ImagePlus size={26} color="var(--text3)" style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload class picture<br /><span style={{ fontSize: 11 }}>PNG, JPG, WEBP etc.</span></p>
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
