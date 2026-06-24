import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Package, Upload, X, FileVideo, FileText } from 'lucide-react'

const COURSES = [
  'LKG Complete Course',
  'UKG Mathematics',
  '1st Grade Science',
  'General Course',
]

const EMPTY = {
  className:   '',
  subjectName: '',
  courseName:  '',
  chapterName: '',
  lessonName:  '',
  pdfFile:     null,
  videoFile:   null,
}

export default function ProductMaster() {
  const { data, CLASSES, SUBJECTS } = useApp()

  const [products, setProducts]   = useState([])
  const [nextId, setNextId]       = useState(1)
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError]         = useState('')

  const pdfRef   = useRef(null)
  const videoRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const reset = () => {
    setForm(EMPTY)
    setEditingId(null)
    setError('')
    if (pdfRef.current)   pdfRef.current.value   = ''
    if (videoRef.current) videoRef.current.value = ''
  }

  // Chapters filtered by selected class
  const filteredChapters = form.className
    ? data.chapters.filter(c => c.class === form.className)
    : data.chapters

  // Lessons filtered by selected chapter
  const filteredLessons = form.chapterName
    ? data.videos.filter(v => {
        const ch = data.chapters.find(c => c.title === form.chapterName)
        return ch ? v.chapterId === ch.id : true
      })
    : data.videos

  /* ---------- Create ---------- */
  const handleCreate = () => {
    const { className, subjectName } = form
    if (!className)   { setError('Class Name is required');   return }
    if (!subjectName) { setError('Subject Name is required'); return }

    setProducts(prev => [
      ...prev,
      { id: nextId, ...form },
    ])
    setNextId(n => n + 1)
    reset()
  }

  /* ---------- Load row for edit ---------- */
  const handleEditClick = (p) => {
    setEditingId(p.id)
    setForm({
      className:   p.className,
      subjectName: p.subjectName,
      courseName:  p.courseName,
      chapterName: p.chapterName,
      lessonName:  p.lessonName,
      pdfFile:     p.pdfFile,
      videoFile:   p.videoFile,
    })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = () => {
    const { className, subjectName } = form
    if (!className)   { setError('Class Name is required');   return }
    if (!subjectName) { setError('Subject Name is required'); return }

    setProducts(prev =>
      prev.map(p => p.id === editingId ? { ...p, ...form } : p)
    )
    reset()
  }

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id))
    if (editingId === id) reset()
  }

  /* ---------- Shared upload button style ---------- */
  const uploadBtnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '9px 14px', background: 'var(--bg2)', border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text3)', fontSize: 13,
    fontWeight: 600, cursor: 'pointer', width: '100%',
    transition: 'border-color 0.2s, color 0.2s',
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Product Master</h1>
          <p>Manage all products available on the platform</p>
        </div>
      </div>

      {/* ── Input Form ── */}
      <div className="card" style={{ marginBottom: 20 }}>

        {/* Row 1 — Class Name | Subject Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select
              className="input"
              value={form.className}
              onChange={e => {
                set('className', e.target.value)
                set('chapterName', '')
                set('lessonName', '')
                setError('')
              }}
            >
              <option value="">— Select Class —</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <select
              className="input"
              value={form.subjectName}
              onChange={e => { set('subjectName', e.target.value); setError('') }}
            >
              <option value="">— Select Subject —</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2 — Course Name | Chapter Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <select
              className="input"
              value={form.courseName}
              onChange={e => set('courseName', e.target.value)}
            >
              <option value="">— Select Course —</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <select
              className="input"
              value={form.chapterName}
              onChange={e => {
                set('chapterName', e.target.value)
                set('lessonName', '')
              }}
            >
              <option value="">— Select Chapter —</option>
              {filteredChapters.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 — Lesson Name | Upload PDF | Upload Video */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Lesson Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Name</label>
            <select
              className="input"
              value={form.lessonName}
              onChange={e => set('lessonName', e.target.value)}
            >
              <option value="">— Select Lesson —</option>
              {filteredLessons.map(v => (
                <option key={v.id} value={v.title}>{v.title}</option>
              ))}
            </select>
          </div>

          {/* Upload PDF */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><FileText size={13} style={{ marginRight: 4 }} />Upload PDF</label>
            <input
              ref={pdfRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) set('pdfFile', f) }}
            />
            {form.pdfFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <FileText size={15} color="var(--red)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {form.pdfFile.name}
                </span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 2 }}
                  onClick={() => { set('pdfFile', null); pdfRef.current.value = '' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button type="button" style={uploadBtnStyle} onClick={() => pdfRef.current.click()}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}>
                <Upload size={14} /> Upload PDF
              </button>
            )}
          </div>
        </div>

        {/* Row 4 — Upload Video | Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Upload Video */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><FileVideo size={13} style={{ marginRight: 4 }} />Upload Video</label>
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files[0]; if (f) set('videoFile', f) }}
            />
            {form.videoFile ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <FileVideo size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {form.videoFile.name}
                </span>
                <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', padding: 2 }}
                  onClick={() => { set('videoFile', null); videoRef.current.value = '' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button type="button" style={uploadBtnStyle} onClick={() => videoRef.current.click()}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}>
                <Upload size={14} /> Upload Video
              </button>
            )}
          </div>

          {/* placeholder to keep grid alignment */}
          <div />
        </div>

        {/* Buttons + Error */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingId === null ? (
            <button className="btn btn-primary" onClick={handleCreate}>
              <Plus size={14} /> Create
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdate}>
                <Edit2 size={14} /> Update
              </button>
              <button className="btn btn-ghost" onClick={reset}>
                Cancel
              </button>
            </>
          )}
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>
          All Products
        </h3>

        {products.length === 0 ? (
          <div className="empty-state">
            <Package size={36} />
            <p>No products found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>SI No</th>
                  <th>Class Name</th>
                  <th>Subject Name</th>
                  <th>Course Name</th>
                  <th>Chapter Name</th>
                  <th>Lesson Name</th>
                  <th>PDF</th>
                  <th>Video</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ background: editingId === p.id ? 'rgba(108,99,255,0.06)' : undefined }}
                  >
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>

                    <td><span className="badge badge-blue">{p.className}</span></td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.subjectName}</td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {p.courseName || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {p.chapterName || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {p.lessonName || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {p.pdfFile
                        ? <span title={p.pdfFile.name}><FileText size={16} color="var(--red)" /></span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {p.videoFile
                        ? <span title={p.videoFile.name}><FileVideo size={16} color="var(--accent)" /></span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(p)}
                          title="Edit this product"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id)}
                          title="Delete this product"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
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
