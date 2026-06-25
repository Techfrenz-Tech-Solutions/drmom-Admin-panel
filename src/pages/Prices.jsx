import { useEffect, useState } from 'react'
import { DollarSign, BookOpen, Layers, Video, GraduationCap, BookMarked, Edit2, Trash2 } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { classNames, flattenLessons, loadAdminCatalog, paiseToRupees, rupeesToPaise, subjectNames } from '../utils/adminData'

const EMPTY = { className: '', subjectName: '', courseId: '', chapterName: '', lessonId: '', amount: '' }

export default function Prices() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditing(null); setError('') }

  const courses = catalog.courses || []
  const lessons = flattenLessons(courses)
  const filteredCourses = courses.filter(c =>
    (!form.className || c.classLabel === form.className) &&
    (!form.subjectName || c.subject === form.subjectName)
  )
  const filteredChapters = (catalog.chapters || []).filter(c =>
    (!form.className || c.classLabel === form.className) &&
    (!form.subjectName || c.subject === form.subjectName) &&
    (!form.courseId || c.courseId === form.courseId)
  )
  const filteredLessons = lessons.filter(v =>
    (!form.courseId || v.courseId === form.courseId) &&
    (!form.chapterName || v.chapterTitle === form.chapterName)
  )

  const validate = () => {
    if (!form.courseId) return 'Course Name is required'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) < 0) return 'Valid pricing amount is required'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      const priceInPaise = rupeesToPaise(form.amount)
      if (form.lessonId) {
        await apiRequest(`/admin/lessons/${form.lessonId}/price`, { method: 'PATCH', body: JSON.stringify({ priceInPaise }) })
      } else {
        await apiRequest(`/admin/courses/${form.courseId}/price`, { method: 'PATCH', body: JSON.stringify({ priceInPaise }) })
      }
      await load()
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setEditing({ type: 'course', id: course.id })
    setForm({
      className: course.classLabel || '',
      subjectName: course.subject || '',
      courseId: course.id,
      chapterName: '',
      lessonId: '',
      amount: String(paiseToRupees(course.priceInPaise)),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Reset price for "${p.title}" to ₹0?`)) return
    try {
      if (p.lesson) {
        await apiRequest(`/admin/lessons/${p.lesson.id}/price`, { method: 'PATCH', body: JSON.stringify({ priceInPaise: 0 }) })
      } else {
        await apiRequest(`/admin/courses/${p.course.id}/price`, { method: 'PATCH', body: JSON.stringify({ priceInPaise: 0 }) })
      }
      await load()
      if (editing?.id === (p.lesson?.id || p.course?.id)) reset()
    } catch (error) {
      setError(error.message)
    }
  }

  const handleEditLesson = (lesson) => {
    setEditing({ type: 'lesson', id: lesson.id })
    setForm({
      className: lesson.classLabel || '',
      subjectName: lesson.subject || '',
      courseId: lesson.courseId,
      chapterName: lesson.chapterTitle || '',
      lessonId: lesson.id,
      amount: String(paiseToRupees(lesson.priceInPaise || lesson.course.priceInPaise)),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const priceCards = [
    ...courses.map(course => ({ id: `course-${course.id}`, type: 'Course', course, amount: paiseToRupees(course.priceInPaise), title: course.title, className: course.classLabel, subjectName: course.subject, chapterName: '-', lessonName: '-' })),
    ...lessons.map(lesson => ({ id: `lesson-${lesson.id}`, type: 'Lesson', lesson, amount: paiseToRupees(lesson.priceInPaise || lesson.course.priceInPaise), title: lesson.title, className: lesson.classLabel, subjectName: lesson.subject, courseName: lesson.courseTitle, chapterName: lesson.chapterTitle || '-', lessonName: lesson.title })),
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pricing Plans</h1>
          <p>Set prices for each class, course and lesson</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); set('courseId', ''); set('chapterName', ''); set('lessonId', ''); setError('') }}>
              <option value="">— Select Class —</option>
              {classNames(catalog).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <select className="input" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); set('courseId', ''); set('chapterName', ''); set('lessonId', ''); setError('') }}>
              <option value="">— Select Subject —</option>
              {subjectNames(catalog).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <select className="input" value={form.courseId} onChange={e => { set('courseId', e.target.value); set('chapterName', ''); set('lessonId', ''); setError('') }}>
              <option value="">— Select Course —</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <select className="input" value={form.chapterName} onChange={e => { set('chapterName', e.target.value); set('lessonId', ''); setError('') }}>
              <option value="">— Optional Chapter —</option>
              {filteredChapters.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Name</label>
            <select className="input" value={form.lessonId} onChange={e => { set('lessonId', e.target.value); setError('') }}>
              <option value="">— Whole Course Price —</option>
              {filteredLessons.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Pricing Amount (₹)</label>
            <input className="input" type="number" min="0" placeholder="e.g. 299" value={form.amount} onChange={e => { set('amount', e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{editing ? 'Update' : 'Submit'}</button>
          <button className="btn btn-ghost" onClick={reset}>Cancel</button>
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      {priceCards.length === 0 ? (
        <div className="card"><div className="empty-state"><DollarSign size={36} /><p>No pricing records yet. Create a course first.</p></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {priceCards.map(p => (
            <div key={p.id} className="card" style={{ borderTop: `3px solid ${editing?.id === (p.course?.id || p.lesson?.id) ? 'var(--yellow, #ffd43b)' : 'var(--accent)'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: 'var(--accent)' }}>₹{p.amount}</div>
                <span className="badge badge-green">{p.type}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: GraduationCap, label: 'Class', value: p.className || '-' },
                  { icon: BookMarked, label: 'Subject', value: p.subjectName || '-' },
                  { icon: BookOpen, label: 'Course', value: p.course?.title || p.courseName || p.title },
                  { icon: Layers, label: 'Chapter', value: p.chapterName },
                  { icon: Video, label: 'Lesson', value: p.lessonName },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={14} color="var(--text3)" style={{ flexShrink: 0 }} />
                    <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => p.lesson ? handleEditLesson(p.lesson) : handleEditCourse(p.course)} title="Edit this price"><Edit2 size={13} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)} title="Reset price to ₹0"><Trash2 size={13} /> Reset</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
