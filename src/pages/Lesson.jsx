import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Video, Upload, CheckCircle, Loader } from 'lucide-react'
import * as tus from 'tus-js-client'
import { apiRequest } from '../utils/api'
import { classNames, loadAdminCatalog, subjectNames } from '../utils/adminData'

const EMPTY = {
  lessonCode:  '',
  lessonName:  '',
  className:   '',
  subjectName: '',
  courseName:  '',
  chapterName: '',
  bunnyVideoId: '',
  bunnyEmbedUrl: '',
  thumbnailUrl: '',
  durationSeconds: '',
  priceInPaise: '',
  isPreview: false,
}

const toLessonRow = (lesson, course) => ({
  id: lesson.id,
  lessonCode: lesson.code || '',
  lessonName: lesson.title,
  className: course.classLabel || course.classId || '',
  subjectName: course.subject || '',
  courseName: course.title,
  courseId: course.id,
  chapterName: lesson.chapterTitle || '',
  bunnyVideoId: lesson.bunnyVideoId || '',
  bunnyEmbedUrl: lesson.bunnyEmbedUrl || '',
  thumbnailUrl: lesson.thumbnailUrl || '',
  durationSeconds: lesson.durationSeconds || '',
  priceInPaise: lesson.priceInPaise || '',
  isPreview: Boolean(lesson.isPreview),
  raw: lesson,
})

export default function Videos() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [] })
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState([])
  const [form, setForm]           = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  const [uploadProgress, setUploadProgress] = useState(0)   // 0-100
  const [uploadStatus, setUploadStatus] = useState('')       // ''|'uploading'|'processing'|'ready'|'error'
  const [uploadMsg, setUploadMsg] = useState('')
  const fileInputRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadStatus('uploading')
    setUploadProgress(0)
    setUploadMsg('Initialising upload…')

    try {
      // Step 1 — Our backend creates the video in Bunny and returns TUS credentials.
      //           No file data touches the VM.
      const creds = await apiRequest('/admin/bunny/videos/init', {
        method: 'POST',
        body: JSON.stringify({ title: form.lessonName.trim() || file.name }),
      })

      set('bunnyVideoId', creds.videoGuid)
      set('bunnyEmbedUrl', creds.embedUrl)
      if (creds.thumbnailUrl) set('thumbnailUrl', creds.thumbnailUrl)

      // Step 2 — Browser uploads directly to Bunny via TUS (zero VM bandwidth)
      await new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: creds.tusEndpoint,
          retryDelays: [0, 3000, 5000, 10000],
          headers: {
            AuthorizationSignature: creds.authSignature,
            AuthorizationExpire: String(creds.authExpire),
            VideoId: creds.videoGuid,
            LibraryId: String(creds.libraryId),
          },
          metadata: { filetype: file.type, title: form.lessonName.trim() || file.name },
          onProgress: (uploaded, total) => {
            setUploadProgress(Math.round((uploaded / total) * 90))
            setUploadMsg(`Uploading… ${Math.round((uploaded / total) * 100)}%`)
          },
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        })
        upload.start()
      })

      setUploadProgress(95)
      setUploadStatus('processing')
      setUploadMsg('Upload done — Bunny is encoding…')

      // Step 3 — Poll until Bunny finishes encoding (status 4)
      for (let i = 0; i < 36; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const s = await apiRequest(`/admin/bunny/videos/${creds.videoGuid}/status`)
          if (s.ready) { setUploadProgress(100); setUploadStatus('ready'); setUploadMsg('Video ready ✓'); return }
          if (s.status === 5 || s.status === 6) throw new Error(s.statusLabel)
          setUploadMsg(`Encoding… (${s.statusLabel})`)
        } catch (pollErr) {
          if (pollErr.message !== 'Request failed') throw pollErr
        }
      }
      // Still encoding after 3 min — that's fine, just let them save the lesson
      setUploadProgress(100)
      setUploadStatus('ready')
      setUploadMsg('Uploaded — encoding in background')

    } catch (err) {
      setUploadStatus('error')
      setUploadMsg(err.message || 'Upload failed')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const loadCourses = async () => {
    const [result, catalogData] = await Promise.all([apiRequest('/admin/courses'), loadAdminCatalog()])
    const loaded = result.courses || []
    setCatalog(catalogData)
    setCourses(loaded)
    setLessons(loaded.flatMap(course => (course.lessons || []).map(lesson => toLessonRow(lesson, course))))
  }

  useEffect(() => {
    loadCourses().catch((error) => setError(error.message))
  }, [])

  const filteredChapters = form.className
    ? (catalog.chapters || []).filter(c => c.classLabel === form.className)
    : (catalog.chapters || [])

  /* ---------- Create ---------- */
  const buildPayload = (course) => ({
    code: form.lessonCode.trim(),
    title: form.lessonName.trim(),
    description: `${form.lessonName.trim()} lesson`,
    orderIndex: editingId
      ? (lessons.find(lesson => lesson.id === editingId)?.raw?.orderIndex || lessons.findIndex(lesson => lesson.id === editingId) + 1 || 1)
      : (course.lessons?.length || 0) + 1,
    chapterTitle: form.chapterName || undefined,
    chapterIndex: form.chapterName
      ? (catalog.chapters || []).find(c => c.title === form.chapterName)?.orderIndex || 1
      : undefined,
    durationSeconds: form.durationSeconds ? Number(form.durationSeconds) : undefined,
    thumbnailUrl: form.thumbnailUrl,
    priceInPaise: form.priceInPaise ? Number(form.priceInPaise) : undefined,
    isPreview: Boolean(form.isPreview),
    bunnyVideoId: form.bunnyVideoId,
    bunnyEmbedUrl: form.bunnyEmbedUrl,
  })

  const handleCreate = async () => {
    const { lessonCode, lessonName, className, subjectName } = form
    if (!lessonCode.trim()) { setError('Lesson Code is required');  return }
    if (!lessonName.trim()) { setError('Lesson Name is required');  return }
    if (!className)         { setError('Class Name is required');   return }
    if (!subjectName)       { setError('Subject Name is required'); return }

    const course = courses.find(c => c.title === form.courseName)
    if (!course) { setError('Course Name is required'); return }

    setLoading(true)
    try {
      await apiRequest(`/admin/courses/${course.id}/lessons`, {
        method: 'POST',
        body: JSON.stringify(buildPayload(course)),
      })
      await loadCourses()
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
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
      bunnyVideoId: l.bunnyVideoId,
      bunnyEmbedUrl: l.bunnyEmbedUrl,
      thumbnailUrl: l.thumbnailUrl,
      durationSeconds: String(l.durationSeconds || ''),
      priceInPaise: String(l.priceInPaise || ''),
      isPreview: l.isPreview,
    })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = async () => {
    const { lessonName, className, subjectName } = form
    if (!lessonName.trim()) { setError('Lesson Name is required');  return }
    if (!className)         { setError('Class Name is required');   return }
    if (!subjectName)       { setError('Subject Name is required'); return }

    const original = lessons.find(l => l.id === editingId)
    const course = courses.find(c => c.id === original?.courseId || c.title === form.courseName)
    if (!course) { setError('Course Name is required'); return }

    setLoading(true)
    try {
      await apiRequest(`/admin/courses/${course.id}/lessons/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(buildPayload(course)),
      })
      await loadCourses()
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    const lesson = lessons.find(l => l.id === id)
    if (!lesson) return
    try {
      await apiRequest(`/admin/courses/${lesson.courseId}/lessons/${id}`, { method: 'DELETE' })
      setLessons(prev => prev.filter(l => l.id !== id))
      if (editingId === id) reset()
    } catch (error) {
      setError(error.message)
    }
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
              {classNames(catalog).map(c => <option key={c} value={c}>{c}</option>)}
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
              {subjectNames(catalog).map(s => <option key={s} value={s}>{s}</option>)}
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
              {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
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

        {/* Upload to Bunny */}
        <div className="card" style={{ marginBottom: 14, background: 'var(--bg2)', border: '1px dashed var(--border)', boxShadow: 'none', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>
            Upload Video to Bunny CDN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={handleVideoUpload}
            />
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {uploadStatus === 'uploading' || uploadStatus === 'processing'
                ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                : uploadStatus === 'ready'
                  ? <CheckCircle size={14} color="var(--green, #22c55e)" />
                  : <Upload size={14} />}
              {uploadStatus === 'uploading' ? `Uploading ${uploadProgress}%` : 'Choose Video File'}
            </button>
            {uploadStatus === 'uploading' && (
              <div style={{ flex: 1, minWidth: 120, height: 6, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
              </div>
            )}
            {uploadMsg && (
              <span style={{ fontSize: 12, color: uploadStatus === 'error' ? 'var(--red)' : uploadStatus === 'ready' ? 'var(--green, #22c55e)' : 'var(--text3)' }}>
                {uploadMsg}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bunny Video ID</label>
            <input className="input" value={form.bunnyVideoId} onChange={e => set('bunnyVideoId', e.target.value)} placeholder="Auto-filled on upload" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Bunny Embed URL</label>
            <input className="input" value={form.bunnyEmbedUrl} onChange={e => set('bunnyEmbedUrl', e.target.value)} placeholder="Auto-filled on upload" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, marginBottom: 14, alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Thumbnail URL</label>
            <input className="input" value={form.thumbnailUrl} onChange={e => set('thumbnailUrl', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Duration Seconds</label>
            <input className="input" type="number" min="0" value={form.durationSeconds} onChange={e => set('durationSeconds', e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Price Paise</label>
            <input className="input" type="number" min="0" value={form.priceInPaise} onChange={e => set('priceInPaise', e.target.value)} />
          </div>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input type="checkbox" checked={form.isPreview} onChange={e => set('isPreview', e.target.checked)} />
            Preview
          </label>
        </div>

        {/* Buttons + Error */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingId === null ? (
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              <Plus size={14} /> {loading ? 'Saving...' : 'Create'}
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                <Edit2 size={14} /> {loading ? 'Saving...' : 'Update'}
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
