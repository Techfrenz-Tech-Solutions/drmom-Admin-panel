import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Layers, FileVideo, FileText, ClipboardList, X, CheckCircle } from 'lucide-react'
import * as tus from 'tus-js-client'
import { apiRequest, API_BASE_URL } from '../utils/api'
import { classNames, loadAdminCatalog, subjectNames } from '../utils/adminData'

const emptyForm = {
  chapterCode: '',
  chapterName: '',
  className: '',
  courseId: '',
  subjectName: '',
  videoFile: null,
  pdfFile: null,
  assessments: [],           // empty = table hidden until "Add Question" clicked
}

export default function Chapters() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ video: null, pdf: null })
  const [videoUploadPct, setVideoUploadPct] = useState(0)
  const [videoUploadMsg, setVideoUploadMsg] = useState('')

  const videoInputRef = useRef(null)
  const pdfInputRef = useRef(null)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((e) => setError(e.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(emptyForm); setEditingId(null); setError(''); setUploadProgress({ video: null, pdf: null }); setVideoUploadPct(0); setVideoUploadMsg('') }

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

  // ─── File upload ──────────────────────────────────────────────────────────
  // PDFs/notes go to Bunny Storage via the backend (never a public URL back —
  // just an internal storage reference + metadata; access is gated per-student
  // by purchase/enrollment at read time).
  const uploadPdfFile = async (file) => {
    const fd = new FormData()
    fd.append('file', file)
    if (editingId) fd.append('chapterId', editingId)
    setUploadProgress(p => ({ ...p, pdf: 'uploading' }))
    try {
      const res = await fetch(`${API_BASE_URL}/admin/uploads/chapter-file`, { method: 'POST', credentials: 'include', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setUploadProgress(p => ({ ...p, pdf: 'done' }))
      return { storagePath: data.storagePath, fileName: file.name, mimeType: data.mimeType, size: data.size }
    } catch (err) {
      setUploadProgress(p => ({ ...p, pdf: 'error' }))
      throw err
    }
  }

  // Videos go straight to Bunny Stream via TUS — the file never touches our
  // server, mirroring the flow on the Videos/Lesson page.
  const uploadVideoToBunny = async (file) => {
    setUploadProgress(p => ({ ...p, video: 'uploading' }))
    setVideoUploadPct(0)
    setVideoUploadMsg('Initialising upload…')
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
            setVideoUploadPct(Math.round((uploaded / total) * 90))
            setVideoUploadMsg(`Uploading… ${Math.round((uploaded / total) * 100)}%`)
          },
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        })
        upload.start()
      })

      setVideoUploadPct(95)
      setVideoUploadMsg('Upload done — Bunny is encoding…')

      for (let i = 0; i < 36; i++) {
        await new Promise(r => setTimeout(r, 5000))
        try {
          const s = await apiRequest(`/admin/bunny/videos/${creds.videoGuid}/status`)
          if (s.ready) { setVideoUploadPct(100); setVideoUploadMsg('Video ready ✓'); break }
          if (s.status === 5 || s.status === 6) throw new Error(s.statusLabel)
          setVideoUploadMsg(`Encoding… (${s.statusLabel})`)
        } catch (pollErr) {
          if (pollErr.message !== 'Request failed') throw pollErr
        }
      }
      if (videoUploadPct < 100) {
        setVideoUploadPct(100)
        setVideoUploadMsg('Uploaded — encoding in background')
      }

      setUploadProgress(p => ({ ...p, video: 'done' }))
      return creds.embedUrl
    } catch (err) {
      setUploadProgress(p => ({ ...p, video: 'error' }))
      setVideoUploadMsg(err.message || 'Upload failed')
      throw err
    }
  }

  // ─── Payload ──────────────────────────────────────────────────────────────
  const buildPayload = (videoUrl, pdfMeta) => ({
    code: form.chapterCode.trim(),
    title: form.chapterName.trim(),
    classLabel: form.className,
    courseId: form.courseId,
    subject: form.subjectName,
    orderIndex: editingId
      ? catalog.chapters.findIndex((item) => item.id === editingId) + 1
      : (catalog.chapters || []).length + 1,
    ...(videoUrl !== undefined && { videoUrl }),
    ...(pdfMeta !== undefined && {
      pdfUrl: pdfMeta.storagePath,
      pdfFileName: pdfMeta.fileName,
      pdfMimeType: pdfMeta.mimeType,
      pdfSize: pdfMeta.size,
    }),
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
      let videoUrl, pdfMeta
      if (form.videoFile) videoUrl = await uploadVideoToBunny(form.videoFile)
      if (form.pdfFile) pdfMeta = await uploadPdfFile(form.pdfFile)
      const data = await apiRequest('/admin/chapters', { method: 'POST', body: JSON.stringify(buildPayload(videoUrl, pdfMeta)) })
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
      videoFile: null,
      pdfFile: null,
      assessments: ch.assessments?.length
        ? ch.assessments.map(a => ({ question: a.question, options: a.options || ['', '', '', ''], answer: a.answer || '' }))
        : [],
    })
    setError('')
    setUploadProgress({ video: null, pdf: null }); setVideoUploadPct(0); setVideoUploadMsg('')
  }

  const handleUpdate = async () => {
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      let videoUrl, pdfMeta
      if (form.videoFile) videoUrl = await uploadVideoToBunny(form.videoFile)
      if (form.pdfFile) pdfMeta = await uploadPdfFile(form.pdfFile)
      const data = await apiRequest(`/admin/chapters/${editingId}`, { method: 'PUT', body: JSON.stringify(buildPayload(videoUrl, pdfMeta)) })
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

  // ─── Upload badge ─────────────────────────────────────────────────────────
  const UploadBadge = ({ status }) => {
    if (!status) return null
    if (status === 'uploading') return <span style={{ fontSize: 12, color: 'var(--accent)' }}>Uploading…</span>
    if (status === 'done') return <span style={{ fontSize: 12, color: '#00d4aa', display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Uploaded</span>
    return <span style={{ fontSize: 12, color: 'var(--red)' }}>Upload failed</span>
  }

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

        {/* ── Row 4: Video + PDF Upload ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          {/* Video */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Video</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '18px 14px', textAlign: 'center', cursor: 'pointer', background: form.videoFile ? 'rgba(108,99,255,0.06)' : 'transparent', transition: 'background 0.2s' }}
              onClick={() => videoInputRef.current?.click()}
            >
              <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }}
                onChange={e => { set('videoFile', e.target.files[0] || null); setUploadProgress(p => ({ ...p, video: null })) }} />
              <FileVideo size={26} color={form.videoFile ? 'var(--accent)' : 'var(--text3)'} style={{ marginBottom: 6 }} />
              {form.videoFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, wordBreak: 'break-all' }}>{form.videoFile.name}</span>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                    onClick={e => { e.stopPropagation(); set('videoFile', null); setUploadProgress(p => ({ ...p, video: null })) }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload video<br /><span style={{ fontSize: 11 }}>MP4, MOV, AVI, etc.</span></p>
              )}
              {uploadProgress.video === 'uploading' ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${videoUploadPct}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{videoUploadMsg}</span>
                </div>
              ) : (
                <div style={{ marginTop: 4 }}><UploadBadge status={uploadProgress.video} /></div>
              )}
            </div>
          </div>

          {/* PDF */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter PDF / Notes</label>
            <div
              style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '18px 14px', textAlign: 'center', cursor: 'pointer', background: form.pdfFile ? 'rgba(0,212,170,0.06)' : 'transparent', transition: 'background 0.2s' }}
              onClick={() => pdfInputRef.current?.click()}
            >
              <input ref={pdfInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => { set('pdfFile', e.target.files[0] || null); setUploadProgress(p => ({ ...p, pdf: null })) }} />
              <FileText size={26} color={form.pdfFile ? '#00d4aa' : 'var(--text3)'} style={{ marginBottom: 6 }} />
              {form.pdfFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, wordBreak: 'break-all' }}>{form.pdfFile.name}</span>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                    onClick={e => { e.stopPropagation(); set('pdfFile', null); setUploadProgress(p => ({ ...p, pdf: null })) }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload PDF / Notes<br /><span style={{ fontSize: 11 }}>PDF, DOC, DOCX</span></p>
              )}
              <div style={{ marginTop: 4 }}><UploadBadge status={uploadProgress.pdf} /></div>
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
            <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
              <Plus size={14} /> {loading ? 'Saving...' : 'Create'}
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                <Edit2 size={14} /> {loading ? 'Saving...' : 'Update'}
              </button>
              <button className="btn btn-ghost" onClick={reset}>Cancel</button>
            </>
          )}
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
