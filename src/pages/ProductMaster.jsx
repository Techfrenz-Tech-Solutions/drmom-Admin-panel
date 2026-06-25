import { useEffect, useState } from 'react'
import { Plus, Edit2, Package, FileVideo, Image } from 'lucide-react'
import { apiRequest } from '../utils/api'
import { classNames, flattenLessons, loadAdminCatalog, subjectNames } from '../utils/adminData'

const EMPTY = {
  className: '',
  subjectName: '',
  courseId: '',
  chapterName: '',
  lessonId: '',
  thumbnailUrl: '',
  bunnyVideoId: '',
  bunnyEmbedUrl: '',
}

export default function ProductMaster() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

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

  const selectedLesson = lessons.find(lesson => lesson.id === form.lessonId)

  const handleSave = async () => {
    if (!selectedLesson) { setError('Lesson Name is required'); return }
    setLoading(true)
    try {
      await apiRequest(`/admin/courses/${selectedLesson.courseId}/lessons/${selectedLesson.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          code: selectedLesson.code || '',
          title: selectedLesson.title,
          description: selectedLesson.description || `${selectedLesson.title} lesson`,
          orderIndex: selectedLesson.orderIndex || 1,
          chapterTitle: selectedLesson.chapterTitle || undefined,
          chapterIndex: selectedLesson.chapterIndex || undefined,
          durationSeconds: selectedLesson.durationSeconds || undefined,
          thumbnailUrl: form.thumbnailUrl,
          priceInPaise: selectedLesson.priceInPaise || undefined,
          viewsLabel: selectedLesson.viewsLabel || undefined,
          ratingLabel: selectedLesson.ratingLabel || undefined,
          isPreview: Boolean(selectedLesson.isPreview),
          bunnyVideoId: form.bunnyVideoId,
          bunnyEmbedUrl: form.bunnyEmbedUrl,
        }),
      })
      await load()
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (lesson) => {
    setEditingId(lesson.id)
    setForm({
      className: lesson.classLabel || '',
      subjectName: lesson.subject || '',
      courseId: lesson.courseId,
      chapterName: lesson.chapterTitle || '',
      lessonId: lesson.id,
      thumbnailUrl: lesson.thumbnailUrl || '',
      bunnyVideoId: lesson.bunnyVideoId || '',
      bunnyEmbedUrl: lesson.bunnyEmbedUrl || '',
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Product Master</h1>
          <p>Attach video playback metadata and thumbnails to lessons</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
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
            <select className="input" value={form.courseId} onChange={e => { set('courseId', e.target.value); set('chapterName', ''); set('lessonId', '') }}>
              <option value="">— Select Course —</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <select className="input" value={form.chapterName} onChange={e => { set('chapterName', e.target.value); set('lessonId', '') }}>
              <option value="">— Select Chapter —</option>
              {filteredChapters.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Lesson Name</label>
            <select className="input" value={form.lessonId} onChange={e => {
              const lesson = lessons.find(item => item.id === e.target.value)
              setForm(f => ({
                ...f,
                lessonId: e.target.value,
                thumbnailUrl: lesson?.thumbnailUrl || '',
                bunnyVideoId: lesson?.bunnyVideoId || '',
                bunnyEmbedUrl: lesson?.bunnyEmbedUrl || '',
              }))
            }}>
              <option value="">— Select Lesson —</option>
              {filteredLessons.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><Image size={13} style={{ marginRight: 4 }} />Thumbnail URL</label>
            <input className="input" value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><FileVideo size={13} style={{ marginRight: 4 }} />Bunny Video ID</label>
            <input className="input" value={form.bunnyVideoId} onChange={e => set('bunnyVideoId', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label"><FileVideo size={13} style={{ marginRight: 4 }} />Bunny Embed URL</label>
            <input className="input" value={form.bunnyEmbedUrl} onChange={e => set('bunnyEmbedUrl', e.target.value)} placeholder="https://iframe.mediadelivery.net/..." />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}><Plus size={14} /> {loading ? 'Saving...' : editingId ? 'Update' : 'Attach'}</button>
          <button className="btn btn-ghost" onClick={reset}>Cancel</button>
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>All Products</h3>
        {lessons.length === 0 ? (
          <div className="empty-state"><Package size={36} /><p>No products found. Create lessons first.</p></div>
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
                  <th>Thumbnail</th>
                  <th>Video</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((p, i) => (
                  <tr key={p.id} style={{ background: editingId === p.id ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td><span className="badge badge-blue">{p.classLabel || '-'}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.subject || '-'}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.courseTitle}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.chapterTitle || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.title}</td>
                    <td style={{ textAlign: 'center' }}>{p.thumbnailUrl ? <Image size={16} color="var(--green)" /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ textAlign: 'center' }}>{p.bunnyVideoId || p.bunnyEmbedUrl ? <FileVideo size={16} color="var(--accent)" /> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ textAlign: 'center' }}><button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(p)} title="Edit this product"><Edit2 size={13} /> Edit</button></td>
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
