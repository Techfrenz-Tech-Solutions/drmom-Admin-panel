import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Layers } from 'lucide-react'

const COURSES = [
  'LKG Complete Course',
  'UKG Mathematics',
  '1st Grade Science',
  'General Course',
]

const emptyForm = {
  chapterCode: '',
  chapterName: '',
  className:   '',
  courseName:  '',
  subjectName: '',
}

export default function Chapters() {
  const { data, CLASSES, SUBJECTS, addChapter, updateChapter, deleteChapter } = useApp()

  const [form, setForm]           = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const reset = () => { setForm(emptyForm); setEditingId(null); setError('') }

  // Build display list with auto codes
  const chapterList = data.chapters.map((ch, i) => ({
    ...ch,
    code:   `CHP-${String(i + 1).padStart(3, '0')}`,
    course: ch.course || '',
  }))

  /* ---------- Create ---------- */
  const handleCreate = () => {
    const { chapterCode, chapterName, className, subjectName } = form
    if (!chapterCode.trim()) { setError('Chapter Code is required'); return }
    if (!chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!className)          { setError('Class Name is required');   return }
    if (!subjectName)        { setError('Subject Name is required'); return }

    addChapter({
      title:   chapterName.trim(),
      class:   className,
      subject: subjectName,
      course:  form.courseName,
      order:   data.chapters.length + 1,
    })
    reset()
  }

  /* ---------- Load row for edit ---------- */
  const handleEditClick = (ch) => {
    setEditingId(ch.id)
    setForm({
      chapterCode: ch.code,
      chapterName: ch.title,
      className:   ch.class,
      courseName:  ch.course || '',
      subjectName: ch.subject,
    })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = () => {
    const { chapterName, className, subjectName } = form
    if (!chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!className)          { setError('Class Name is required');   return }
    if (!subjectName)        { setError('Subject Name is required'); return }

    updateChapter(editingId, {
      title:   chapterName.trim(),
      class:   className,
      subject: subjectName,
      course:  form.courseName,
    })
    reset()
  }

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    deleteChapter(id)
    if (editingId === id) reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Chapters</h1>
          <p>{data.chapters.length} chapters across all classes</p>
        </div>
      </div>

      {/* ── Input Form ── */}
      <div className="card" style={{ marginBottom: 20 }}>

        {/* Row 1 — Chapter Code | Chapter Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Code</label>
            <input
              className="input"
              placeholder="e.g. CHP-001"
              value={form.chapterCode}
              onChange={e => { set('chapterCode', e.target.value); setError('') }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <input
              className="input"
              placeholder="e.g. Numbers 1-10"
              value={form.chapterName}
              onChange={e => { set('chapterName', e.target.value); setError('') }}
            />
          </div>
        </div>

        {/* Row 2 — Class Name | Course Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select
              className="input"
              value={form.className}
              onChange={e => { set('className', e.target.value); setError('') }}
            >
              <option value="">— Select Class —</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

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
        </div>

        {/* Row 3 — Subject Name (single box) */}
        <div style={{ marginBottom: 14 }}>
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
          All Chapters
        </h3>
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
              {chapterList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>
                    <div className="empty-state">
                      <Layers size={32} />
                      <p>No chapters found. Use the form above to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                chapterList.map((ch, i) => (
                  <tr
                    key={ch.id}
                    style={{ background: editingId === ch.id ? 'rgba(108,99,255,0.06)' : undefined }}
                  >
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {ch.code}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Layers size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ch.title}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-blue">{ch.class}</span>
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {ch.course || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{ch.subject}</td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(ch)}
                          title="Edit this chapter"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(ch.id)}
                          title="Delete this chapter"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
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
