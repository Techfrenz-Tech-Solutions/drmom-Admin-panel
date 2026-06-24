import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { DollarSign, BookOpen, Layers, Video, GraduationCap, BookMarked, Edit2, Trash2 } from 'lucide-react'

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
  amount:      '',
}

export default function Prices() {                                                                                                                                                                                                              const { data, CLASSES, SUBJECTS } = useApp()

  const [form, setForm]           = useState(EMPTY)
  const [submitted, setSubmitted] = useState([])
  const [editingId, setEditingId] = useState(null)   // null = create mode
  const [error, setError]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  // Chapters filtered by class
  const filteredChapters = form.className
    ? data.chapters.filter(c => c.class === form.className)
    : data.chapters

  // Lessons filtered by chapter
  const filteredLessons = form.chapterName
    ? data.videos.filter(v => {
        const ch = data.chapters.find(c => c.title === form.chapterName)
        return ch ? v.chapterId === ch.id : true
      })
    : data.videos

  const validate = () => {
    if (!form.className)   return 'Class Name is required'
    if (!form.subjectName) return 'Subject Name is required'
    if (!form.courseName)  return 'Course Name is required'
    if (!form.chapterName) return 'Chapter Name is required'
    if (!form.lessonName)  return 'Lesson Name is required'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
                           return 'Valid pricing amount is required'
    return ''
  }

  /* ---------- Submit / Update ---------- */
  const handleSubmit = () => {
    const err = validate()
    if (err) { setError(err); return }

    if (editingId === null) {
      // Create new
      setSubmitted(prev => [
        ...prev,
        { id: Date.now(), ...form, amount: Number(form.amount) },
      ])
    } else {
      // Update existing
      setSubmitted(prev =>
        prev.map(p =>
          p.id === editingId ? { ...p, ...form, amount: Number(form.amount) } : p
        )
      )
    }
    reset()
  }

  /* ---------- Add More — clear form ---------- */
  const handleAddMore = () => reset()

  /* ---------- Load card for editing ---------- */
  const handleEditClick = (p) => {
    setEditingId(p.id)
    setForm({
      className:   p.className,
      subjectName: p.subjectName,
      courseName:  p.courseName,
      chapterName: p.chapterName,
      lessonName:  p.lessonName,
      amount:      String(p.amount),
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    setSubmitted(prev => prev.filter(p => p.id !== id))
    if (editingId === id) reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Pricing Plans</h1>
          <p>Set subscription prices for each class, course and lesson</p>
        </div>
      </div>

      {/* ── Input Form ── */}
      <div className="card" style={{ marginBottom: 24 }}>

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
              onChange={e => { set('courseName', e.target.value); setError('') }}
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
                setError('')
              }}
            >
              <option value="">— Select Chapter —</option>
              {filteredChapters.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 — Lesson Name | Pricing Amount */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Name</label>
            <select
              className="input"
              value={form.lessonName}
              onChange={e => { set('lessonName', e.target.value); setError('') }}
            >
              <option value="">— Select Lesson —</option>
              {filteredLessons.map(v => (
                <option key={v.id} value={v.title}>{v.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pricing Amount (₹)</label>
            <input
              className="input"
              type="number"
              min="0"
              placeholder="e.g. 299"
              value={form.amount}
              onChange={e => { set('amount', e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        {/* Buttons + Error */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingId === null ? 'Submit' : 'Update'}
          </button>
          {editingId === null ? (
            <button className="btn btn-ghost" onClick={handleAddMore}>
              Add More
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={reset}>
              Cancel
            </button>
          )}
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      {/* ── Price Cards ── */}
      {submitted.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <DollarSign size={36} />
            <p>No pricing plans yet. Fill the form and click Submit.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {submitted.map(p => (
            <div
              key={p.id}
              className="card"
              style={{
                borderTop: `3px solid ${editingId === p.id ? 'var(--yellow, #ffd43b)' : 'var(--accent)'}`,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {/* Amount + badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: 'var(--accent)' }}>
                  ₹{p.amount}
                </div>
                <span className="badge badge-green">Active</span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: GraduationCap, label: 'Class',   value: p.className   },
                  { icon: BookMarked,    label: 'Subject',  value: p.subjectName },
                  { icon: BookOpen,      label: 'Course',   value: p.courseName  },
                  { icon: Layers,        label: 'Chapter',  value: p.chapterName },
                  { icon: Video,         label: 'Lesson',   value: p.lessonName  },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} color="var(--text3)" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit / Delete */}
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleEditClick(p)}
                  title="Edit this plan"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(p.id)}
                  title="Delete this plan"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
