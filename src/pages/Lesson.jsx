import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Plus, Edit2, Trash2, Video } from 'lucide-react'

const COURSES = [
  'LKG Complete Course',
  'UKG Mathematics',
  '1st Grade Science',
  'General Course',
]

const EMPTY = {
  lessonCode:  '',
  lessonName:  '',
  className:   '',
  subjectName: '',
  courseName:  '',
  chapterName: '',
}

export default function Videos() {
  const { data, CLASSES, SUBJECTS, addVideo, updateVideo, deleteVideo } = useApp()

  const [lessons, setLessons] = useState(
    data.videos.map((v, i) => {
      const chapter = data.chapters.find(c => c.id === v.chapterId)
      return {
        id:          v.id,
        lessonCode:  `LES-${String(i + 1).padStart(3, '0')}`,
        lessonName:  v.title,
        className:   v.class,
        subjectName: v.subject,
        courseName:  '',
        chapterName: chapter?.title || '',
      }
    })
  )
  const [nextId, setNextId]       = useState(100)
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError]         = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  // Chapters filtered by selected class
  const filteredChapters = form.className
    ? data.chapters.filter(c => c.class === form.className)
    : data.chapters

  /* ---------- Create ---------- */
  const handleCreate = () => {
    const { lessonCode, lessonName, className, subjectName } = form
    if (!lessonCode.trim()) { setError('Lesson Code is required');  return }
    if (!lessonName.trim()) { setError('Lesson Name is required');  return }
    if (!className)         { setError('Class Name is required');   return }
    if (!subjectName)       { setError('Subject Name is required'); return }

    const chapter = data.chapters.find(c => c.title === form.chapterName)
    addVideo({
      title:     lessonName.trim(),
      class:     className,
      subject:   subjectName,
      chapterId: chapter?.id || '',
      duration:  '',
      url:       '',
      thumbnail: '',
      order:     lessons.length + 1,
      free:      false,
    })

    setLessons(prev => [
      ...prev,
      {
        id:          nextId,
        lessonCode:  lessonCode.trim(),
        lessonName:  lessonName.trim(),
        className,
        subjectName,
        courseName:  form.courseName,
        chapterName: form.chapterName,
      },
    ])
    setNextId(n => n + 1)
    reset()
  }

  /* ---------- Load row for edit ---------- */
  const handleEditClick = (l) => {
    setEditingId(l.id)
    setForm({
      lessonCode:  l.lessonCode,
      lessonName:  l.lessonName,
      className:   l.className,
      subjectName: l.subjectName,
      courseName:  l.courseName,
      chapterName: l.chapterName,
    })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = () => {
    const { lessonName, className, subjectName } = form
    if (!lessonName.trim()) { setError('Lesson Name is required');  return }
    if (!className)         { setError('Class Name is required');   return }
    if (!subjectName)       { setError('Subject Name is required'); return }

    const original = lessons.find(l => l.id === editingId)
    if (original) {
      const chapter = data.chapters.find(c => c.title === form.chapterName)
      updateVideo(original.id, {
        title:     lessonName.trim(),
        class:     className,
        subject:   subjectName,
        chapterId: chapter?.id || '',
      })
    }

    setLessons(prev =>
      prev.map(l =>
        l.id === editingId
          ? {
              ...l,
              lessonCode:  form.lessonCode.trim(),
              lessonName:  lessonName.trim(),
              className,
              subjectName,
              courseName:  form.courseName,
              chapterName: form.chapterName,
            }
          : l
      )
    )
    reset()
  }

  /* ---------- Delete ---------- */
  const handleDelete = (id) => {
    deleteVideo(id)
    setLessons(prev => prev.filter(l => l.id !== id))
    if (editingId === id) reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Lesson Master</h1>
          <p>{lessons.length} lessons across all classes</p>
        </div>
      </div>

      {/* ── Input Form ── */}
      <div className="card" style={{ marginBottom: 20 }}>

        {/* Row 1 — Lesson Code | Lesson Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Code</label>
            <input
              className="input"
              placeholder="e.g. LES-001"
              value={form.lessonCode}
              onChange={e => { set('lessonCode', e.target.value); setError('') }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Name</label>
            <input
              className="input"
              placeholder="e.g. Counting 1 to 10"
              value={form.lessonName}
              onChange={e => { set('lessonName', e.target.value); setError('') }}
            />
          </div>
        </div>

        {/* Row 2 — Class Name | Subject Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select
              className="input"
              value={form.className}
              onChange={e => {
                set('className', e.target.value)
                set('chapterName', '')
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

        {/* Row 3 — Course Name | Chapter Name */}
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
              onChange={e => set('chapterName', e.target.value)}
            >
              <option value="">— Select Chapter —</option>
              {filteredChapters.map(c => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
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
          All Lessons
        </h3>

        {lessons.length === 0 ? (
          <div className="empty-state">
            <Video size={36} />
            <p>No lessons found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>SI No</th>
                  <th>Lesson Code</th>
                  <th>Lesson Name</th>
                  <th>Class Name</th>
                  <th>Subject Name</th>
                  <th>Course Name</th>
                  <th>Chapter Name</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l, i) => (
                  <tr
                    key={l.id}
                    style={{ background: editingId === l.id ? 'rgba(108,99,255,0.06)' : undefined }}
                  >
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {l.lessonCode}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Video size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{l.lessonName}</span>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-blue">{l.className}</span>
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{l.subjectName}</td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {l.courseName || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>
                      {l.chapterName || <span style={{ color: 'var(--text3)' }}>—</span>}
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(l)}
                          title="Edit this lesson"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(l.id)}
                          title="Delete this lesson"
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
