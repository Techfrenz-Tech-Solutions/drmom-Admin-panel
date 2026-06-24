import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'

const INIT_COURSES = [
  { id: 1, code: 'CRS-001', title: 'LKG Complete Course', subject: 'All Subjects', class: 'LKG' },
  { id: 2, code: 'CRS-002', title: 'UKG Mathematics',     subject: 'Mathematics',  class: 'UKG' },
  { id: 3, code: 'CRS-003', title: '1st Grade Science',   subject: 'Science',      class: '1st' },
]

const EMPTY = { courseCode: '', courseName: '', subjectName: '', className: '' }

export default function Courses() {
  const { CLASSES, SUBJECTS } = useApp()

  const [courses, setCourses]     = useState(INIT_COURSES)
  const [nextId, setNextId]       = useState(10)
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  /* ---------- Create ---------- */
  const handleCreate = () => {
    const { courseCode, courseName, subjectName, className } = form
    if (!courseCode.trim()) { setError('Course Code is required');  return }
    if (!courseName.trim()) { setError('Course Name is required');  return }
    if (!subjectName)       { setError('Subject Name is required'); return }
    if (!className)         { setError('Class Name is required');   return }

    setCourses(prev => [
      ...prev,
      { id: nextId, code: courseCode.trim(), title: courseName.trim(), subject: subjectName, class: className },
    ])
    setNextId(n => n + 1)
    reset()
  }

  /* ---------- Load row for edit ---------- */
  const handleEditClick = (c) => {
    setEditingId(c.id)
    setForm({ courseCode: c.code, courseName: c.title, subjectName: c.subject, className: c.class })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = () => {
    const { courseCode, courseName, subjectName, className } = form
    if (!courseName.trim()) { setError('Course Name is required');  return }
    if (!subjectName)       { setError('Subject Name is required'); return }
    if (!className)         { setError('Class Name is required');   return }

    setCourses(prev =>
      prev.map(c =>
        c.id === editingId
          ? { ...c, code: courseCode.trim(), title: courseName.trim(), subject: subjectName, class: className }
          : c
      )
    )
    reset()
  }

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
    if (editingId === id) reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage all courses available on the platform</p>
        </div>
      </div>

      {/* ── Input Form — 2 rows × 2 cols ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Course Code */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Code</label>
            <input
              className="input"
              placeholder="e.g. CRS-001"
              value={form.courseCode}
              onChange={e => { set('courseCode', e.target.value); setError('') }}
            />
          </div>

          {/* Course Name */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <input
              className="input"
              placeholder="e.g. LKG Complete Course"
              value={form.courseName}
              onChange={e => { set('courseName', e.target.value); setError('') }}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Subject Name */}
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

          {/* Class Name */}
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
          All Courses
        </h3>

        {courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={36} />
            <p>No courses found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>SI No</th>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Subject Name</th>
                  <th>Class Name</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{ background: editingId === c.id ? 'rgba(108,99,255,0.06)' : undefined }}
                  >
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {c.code}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{c.title}</span>
                      </div>
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{c.subject}</td>

                    <td>
                      <span className="badge badge-blue">{c.class}</span>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(c)}
                          title="Edit this course"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(c.id)}
                          title="Delete this course"
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
