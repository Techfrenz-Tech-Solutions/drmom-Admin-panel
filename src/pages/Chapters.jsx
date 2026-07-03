import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Layers, FileVideo, FileText, ClipboardList, Eye, Play } from 'lucide-react'
import * as tus from 'tus-js-client'
import { apiRequest, API_BASE_URL } from '../utils/api'
import { classNames, loadAdminCatalog, subjectNames } from '../utils/adminData'

// crypto.randomUUID() only exists in secure contexts (HTTPS/localhost) — the
// admin panel is served over plain HTTP, so it's unavailable here and throws,
// silently breaking the caller. This just needs to be unique within the
// current form session, not a real UUID, so a plain fallback is fine.
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const emptyForm = {
  chapterCode: '',
  chapterName: '',
  className: '',
  courseId: '',
  subjectName: '',
  videos: [],                // [{ id, embedUrl, bunnyVideoId, title, status, pct, msg, file }]
  materials: [],              // [{ id, storagePath, fileName, mimeType, size, previewUrl, status, msg }]
  playingVideoId: null,
  assessments: [],           // empty = table hidden until "Add Question" clicked
}

export default function Chapters() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const videoInputRef = useRef(null)
  const pdfInputRef = useRef(null)
  const replaceVideoInputRef = useRef(null)
  const replaceMaterialInputRef = useRef(null)
  const replaceVideoTargetId = useRef(null)
  const replaceMaterialTargetId = useRef(null)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((e) => setError(e.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(emptyForm); setEditingId(null); setError('') }

  // ─── Assessment helpers ───────────────────────────────────────────────────
  const addAssessment = () =>
    setForm(f => ({ ...f, assessments: [...f.assessments, { question: '', options: ['', '', '', ''], answer: '' }] }))

  const removeAssessment = (idx) =>
    setForm(f => ({ ...f, assessments: f.assessments.filter((_, i) => i !== idx) }))

  const setAssessmentField = (idx, field, value) =>
    setForm(f => ({ ...f, assessments: f.assessments.map((a, i) => i === idx ? { ...a, [field]: value } : a) }))

  const setAssessmentOption = (idx, optIdx, value) =>
    setForm(f => ({
      ...f,
      assessments: f.assessments.map((a, i) => {
        if (i !== idx) return a
        return { ...a, options: a.options.map((o, oi) => oi === optIdx ? value : o) }
      }),
    }))

  // ─── Video items (multiple per chapter) ────────────────────────────────────
  const updateVideoItem = (id, patch) =>
    setForm(f => ({ ...f, videos: f.videos.map(v => v.id === id ? { ...v, ...patch } : v) }))

  // Videos go straight to Bunny Stream via TUS — the file never touches our
  // server. Used for both a brand-new item and an in-place Replace.
  const uploadVideoItem = async (file, id) => {
    updateVideoItem(id, { status: 'uploading', pct: 0, msg: 'Initialising upload…' })
    try {
      const creds = await apiRequest('/admin/bunny/videos/init', {
        method: 'POST',
        body: JSON.stringify({ title: form.chapterName.trim() || file.name }),
      })

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
          metadata: { filetype: file.type, title: form.chapterName.trim() || file.name },
          onProgress: (uploaded, total) => {
            updateVideoItem(id, { pct: Math.round((uploaded / total) * 90), msg: `Uploading… ${Math.round((uploaded / total) * 100)}%` })
          },
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        })
        upload.start()
      })

      updateVideoItem(id, { pct: 95, msg: 'Upload done — Bunny is encoding…' })

      let ready = false
      for (let i = 0; i < 36; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const s = await apiRequest(`/admin/bunny/videos/${creds.videoGuid}/status`)
          if (s.ready) { ready = true; break }
          if (s.status === 5 || s.status === 6) throw new Error(s.statusLabel)
          updateVideoItem(id, { msg: `Encoding… (${s.statusLabel})` })
        } catch (pollErr) {
          if (pollErr.message !== 'Request failed') throw pollErr
        }
      }

      updateVideoItem(id, {
        status: 'done',
        pct: 100,
        msg: ready ? 'Video ready ✓' : 'Uploaded — encoding in background',
        embedUrl: creds.embedUrl,
        bunnyVideoId: creds.videoGuid,
        file: undefined,
      })
    } catch (err) {
      updateVideoItem(id, { status: 'error', msg: err.message || 'Upload failed' })
    }
  }

  const handleAddVideos = (fileList) => {
    const files = Array.from(fileList || [])
    const items = files.map(file => ({ id: generateId(), status: 'uploading', file, title: file.name }))
    if (!items.length) return
    setForm(f => ({ ...f, videos: [...f.videos, ...items] }))
    items.forEach(item => uploadVideoItem(item.file, item.id))
  }

  const handleReplaceVideoClick = (id) => { replaceVideoTargetId.current = id; replaceVideoInputRef.current?.click() }
  const handleReplaceVideoChange = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file && replaceVideoTargetId.current) uploadVideoItem(file, replaceVideoTargetId.current)
  }

  const deleteVideo = (id) =>
    setForm(f => ({ ...f, videos: f.videos.filter(v => v.id !== id), playingVideoId: f.playingVideoId === id ? null : f.playingVideoId }))

  const togglePlayVideo = (id) => setForm(f => ({ ...f, playingVideoId: f.playingVideoId === id ? null : id }))

  // ─── Material items (multiple PDF/notes per chapter) ───────────────────────
  const updateMaterialItem = (id, patch) =>
    setForm(f => ({ ...f, materials: f.materials.map(m => m.id === id ? { ...m, ...patch } : m) }))

  // PDFs/notes go to Bunny Storage via the backend — never a public URL back,
  // just an internal storage reference + metadata; access is gated per-student
  // by purchase/enrollment at read time.
  const uploadMaterialItem = async (file, id) => {
    updateMaterialItem(id, { status: 'uploading', fileName: file.name })
    const fd = new FormData()
    fd.append('file', file)
    if (editingId) fd.append('chapterId', editingId)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/uploads/chapter-file`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      updateMaterialItem(id, {
        status: 'done',
        storagePath: data.storagePath,
        fileName: file.name,
        mimeType: data.mimeType,
        size: data.size,
        previewUrl: data.previewUrl,
      })
    } catch (err) {
      updateMaterialItem(id, { status: 'error', msg: err.message || 'Upload failed' })
    }
  }

  const handleAddMaterials = (fileList) => {
    const files = Array.from(fileList || [])
    const items = files.map(file => ({ id: generateId(), status: 'uploading', fileName: file.name }))
    if (!items.length) return
    setForm(f => ({ ...f, materials: [...f.materials, ...items] }))
    items.forEach((item, idx) => uploadMaterialItem(files[idx], item.id))
  }

  const handleReplaceMaterialClick = (id) => { replaceMaterialTargetId.current = id; replaceMaterialInputRef.current?.click() }
  const handleReplaceMaterialChange = (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (file && replaceMaterialTargetId.current) uploadMaterialItem(file, replaceMaterialTargetId.current)
  }

  const deleteMaterial = (id) => setForm(f => ({ ...f, materials: f.materials.filter(m => m.id !== id) }))

  const anyUploading = form.videos.some(v => v.status === 'uploading') || form.materials.some(m => m.status === 'uploading')

  // ─── Payload ──────────────────────────────────────────────────────────────
  // videos/materials are always sent as the complete current list — adds,
  // replaces, and deletes are all resolved client-side first, so the array
  // itself is the source of truth on save, not a patch.
  const buildPayload = () => ({
    code: form.chapterCode.trim(),
    title: form.chapterName.trim(),
    classLabel: form.className,
    courseId: form.courseId,
    subject: form.subjectName,
    orderIndex: editingId
      ? catalog.chapters.findIndex((item) => item.id === editingId) + 1
      : (catalog.chapters || []).length + 1,
    videos: form.videos
      .filter(v => v.status === 'done' || v.status === 'existing')
      .map(v => ({ id: v.id, embedUrl: v.embedUrl, bunnyVideoId: v.bunnyVideoId, title: v.title })),
    materials: form.materials
      .filter(m => m.status === 'done' || m.status === 'existing')
      .map(m => ({ id: m.id, storagePath: m.storagePath, fileName: m.fileName, mimeType: m.mimeType, size: m.size })),
    assessments: form.assessments
      .filter(a => a.question.trim())
      .map(a => ({ question: a.question.trim(), options: a.options, answer: a.answer })),
  })

  // ─── CRUD ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.chapterCode.trim()) { setError('Chapter Code is required'); return }
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest('/admin/chapters', { method: 'POST', body: JSON.stringify(buildPayload()) })
      setCatalog(prev => ({ ...prev, chapters: [...(prev.chapters || []), data.chapter] }))
      reset()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleEditClick = (ch) => {
    setEditingId(ch.id)
    setForm({
      chapterCode: ch.code || '',
      chapterName: ch.title,
      className: ch.classLabel || '',
      courseId: ch.courseId || '',
      subjectName: ch.subject || '',
      videos: (ch.videos || []).map(v => ({ ...v, status: 'existing' })),
      materials: (ch.materials || []).map(m => ({ ...m, status: 'existing' })),
      playingVideoId: null,
      assessments: ch.assessments?.length
        ? ch.assessments.map(a => ({ question: a.question, options: a.options || ['', '', '', ''], answer: a.answer || '' }))
        : [],
    })
    setError('')
  }

  const handleUpdate = async () => {
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      const data = await apiRequest(`/admin/chapters/${editingId}`, { method: 'PUT', body: JSON.stringify(buildPayload()) })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.map(c => c.id === editingId ? data.chapter : c) }))
      reset()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await apiRequest(`/admin/chapters/${id}`, { method: 'DELETE' })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.filter(c => c.id !== id) }))
      if (editingId === id) reset()
    } catch (e) { setError(e.message) }
  }

  const classes = classNames(catalog)
  const subjects = subjectNames(catalog)
  const chapters = catalog.chapters || []
  const courses = catalog.courses || []

  const thStyle = {
    padding: '9px 12px',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: 'var(--text3)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    background: 'rgba(108,99,255,0.06)',
    textAlign: 'left',
  }

  const itemCardStyle = { border: '1px solid var(--border)', borderRadius: 8, padding: 10 }
  const itemActionsStyle = { display: 'flex', gap: 6, flexWrap: 'wrap' }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Chapters</h1>
          <p>{chapters.length} chapters across all classes</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>

        {/* ── Row 1: Chapter Code + Name ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Code</label>
            <input className="input" placeholder="e.g. CHP-001" value={form.chapterCode} onChange={e => { set('chapterCode', e.target.value); setError('') }} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Name</label>
            <input className="input" placeholder="e.g. Numbers 1-10" value={form.chapterName} onChange={e => { set('chapterName', e.target.value); setError('') }} />
          </div>
        </div>

        {/* ── Row 2: Class + Course ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); setError('') }}>
              <option value="">— Select Class —</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <select className="input" value={form.courseId} onChange={e => set('courseId', e.target.value)}>
              <option value="">— Select Course —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        {/* ── Row 3: Subject ── */}
        <div style={{ marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <select className="input" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); setError('') }}>
              <option value="">— Select Subject —</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Row 4: Videos + PDF/Notes ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Videos */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Videos</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 12 }}>
              {form.videos.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 10px', textAlign: 'center' }}>No videos yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {form.videos.map(v => (
                    <div key={v.id} style={itemCardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <FileVideo size={16} color={v.status === 'error' ? 'var(--red)' : 'var(--accent)'} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, wordBreak: 'break-all', minWidth: 80 }}>
                          {v.title || 'Video'}
                        </span>
                        {v.status === 'uploading' && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{v.msg || 'Uploading…'}</span>}
                        {v.status === 'error' && <span style={{ fontSize: 11, color: 'var(--red)' }}>{v.msg || 'Upload failed'}</span>}
                        {(v.status === 'done' || v.status === 'existing') && (
                          <div style={itemActionsStyle}>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePlayVideo(v.id)}>
                              <Play size={12} /> {form.playingVideoId === v.id ? 'Hide' : 'Play'}
                            </button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleReplaceVideoClick(v.id)}>Replace</button>
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteVideo(v.id)}><Trash2 size={12} /></button>
                          </div>
                        )}
                      </div>
                      {v.status === 'uploading' && (
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginTop: 6 }}>
                          <div style={{ height: '100%', width: `${v.pct || 0}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
                        </div>
                      )}
                      {form.playingVideoId === v.id && v.embedUrl && (
                        <div style={{ marginTop: 8, borderRadius: 6, overflow: 'hidden', background: '#000' }}>
                          <iframe src={v.embedUrl} title={v.title || 'video'} style={{ width: '100%', height: 140, border: 0, display: 'block' }} allow="autoplay; encrypted-media" allowFullScreen />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => videoInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={13} /> Add Video
              </button>
              <input ref={videoInputRef} type="file" accept="video/*" multiple style={{ display: 'none' }}
                onChange={e => { handleAddVideos(e.target.files); e.target.value = '' }} />
              <input ref={replaceVideoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleReplaceVideoChange} />
            </div>
          </div>

          {/* PDF / Notes */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter PDF / Notes</label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 12 }}>
              {form.materials.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: '4px 0 10px', textAlign: 'center' }}>No files yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {form.materials.map(m => (
                    <div key={m.id} style={{ ...itemCardStyle, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <FileText size={16} color={m.status === 'error' ? 'var(--red)' : '#00d4aa'} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1, wordBreak: 'break-all', minWidth: 80 }}>
                        {m.fileName || 'File'}
                      </span>
                      {m.status === 'uploading' && <span style={{ fontSize: 11, color: 'var(--text3)' }}>Uploading…</span>}
                      {m.status === 'error' && <span style={{ fontSize: 11, color: 'var(--red)' }}>{m.msg || 'Upload failed'}</span>}
                      {(m.status === 'done' || m.status === 'existing') && (
                        <div style={itemActionsStyle}>
                          {m.previewUrl && (
                            <a href={m.previewUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                              <Eye size={12} /> View
                            </a>
                          )}
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleReplaceMaterialClick(m.id)}>Replace</button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteMaterial(m.id)}><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => pdfInputRef.current?.click()} style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={13} /> Add PDF / Notes
              </button>
              <input ref={pdfInputRef} type="file" accept=".pdf,.doc,.docx" multiple style={{ display: 'none' }}
                onChange={e => { handleAddMaterials(e.target.files); e.target.value = '' }} />
              <input ref={replaceMaterialInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleReplaceMaterialChange} />
            </div>
          </div>
        </div>

        {/* ── Row 5: Assessments ── */}
        <div style={{ marginBottom: 14 }}>

          {/* Header row with label + Add Question button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.assessments.length > 0 ? 10 : 0 }}>
            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={15} color="var(--accent)" />
              Assessments / Quiz
              {form.assessments.length > 0 && (
                <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '1px 8px', lineHeight: '18px' }}>
                  {form.assessments.length}
                </span>
              )}
            </label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addAssessment}>
              <Plus size={13} /> Add Question
            </button>
          </div>

          {/* Table — only visible once at least one question has been added */}
          {form.assessments.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: 38, textAlign: 'center' }}>#</th>
                      <th style={{ ...thStyle, minWidth: 220 }}>Question</th>
                      <th style={{ ...thStyle, minWidth: 110 }}>Option A</th>
                      <th style={{ ...thStyle, minWidth: 110 }}>Option B</th>
                      <th style={{ ...thStyle, minWidth: 110 }}>Option C</th>
                      <th style={{ ...thStyle, minWidth: 110 }}>Option D</th>
                      <th style={{ ...thStyle, minWidth: 130 }}>Correct Answer</th>
                      <th style={{ ...thStyle, width: 60, textAlign: 'center' }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.assessments.map((a, idx) => (
                      <tr key={idx} style={{ borderTop: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(108,99,255,0.02)' }}>

                        {/* # */}
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>
                          {idx + 1}
                        </td>

                        {/* Question */}
                        <td style={{ padding: '7px 8px' }}>
                          <input
                            className="input"
                            style={{ fontSize: 12, padding: '6px 10px' }}
                            placeholder="Enter question…"
                            value={a.question}
                            onChange={e => setAssessmentField(idx, 'question', e.target.value)}
                          />
                        </td>

                        {/* Options A–D */}
                        {a.options.map((opt, oi) => (
                          <td key={oi} style={{ padding: '7px 8px' }}>
                            <input
                              className="input"
                              style={{ fontSize: 12, padding: '6px 10px' }}
                              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              value={opt}
                              onChange={e => setAssessmentOption(idx, oi, e.target.value)}
                            />
                          </td>
                        ))}

                        {/* Correct Answer */}
                        <td style={{ padding: '7px 8px' }}>
                          <select
                            className="input"
                            style={{ fontSize: 12, padding: '6px 10px' }}
                            value={a.answer}
                            onChange={e => setAssessmentField(idx, 'answer', e.target.value)}
                          >
                            <option value="">— Select —</option>
                            {a.options.map((opt, oi) => opt.trim() && (
                              <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>
                            ))}
                          </select>
                        </td>

                        {/* Delete button */}
                        <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                          <button
                            type="button"
                            title="Delete this question"
                            className="btn btn-danger btn-sm"
                            style={{ padding: '5px 9px' }}
                            onClick={() => removeAssessment(idx)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {editingId === null ? (
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading || anyUploading}>
              <Plus size={14} /> {loading ? 'Saving...' : 'Create'}
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading || anyUploading}>
                <Edit2 size={14} /> {loading ? 'Saving...' : 'Update'}
              </button>
              <button className="btn btn-ghost" onClick={reset}>Cancel</button>
            </>
          )}
          {anyUploading && <span style={{ color: 'var(--text3)', fontSize: 13 }}>Waiting for uploads to finish…</span>}
          {error && <span style={{ color: 'var(--red)', fontSize: 13 }}>{error}</span>}
        </div>
      </div>

      {/* ── Chapters Table ── */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>All Chapters</h3>
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
              {chapters.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>
                    <div className="empty-state"><Layers size={32} /><p>No chapters found. Use the form above to create one.</p></div>
                  </td>
                </tr>
              ) : (
                chapters.map((ch, i) => (
                  <tr key={ch.id} style={{ background: editingId === ch.id ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {ch.code || `CHP-${String(i + 1).padStart(3, '0')}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Layers size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{ch.title}</span>
                      </div>
                    </td>
                    <td>{ch.classLabel ? <span className="badge badge-blue">{ch.classLabel}</span> : <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{ch.course?.title || <span style={{ color: 'var(--text3)' }}>—</span>}</td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{ch.subject}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(ch)}><Edit2 size={13} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ch.id)}><Trash2 size={13} /> Delete</button>
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
