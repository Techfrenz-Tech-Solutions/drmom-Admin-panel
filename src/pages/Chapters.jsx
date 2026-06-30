import { useEffect, useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Layers, Upload, FileVideo, FileText, ClipboardList, X, CheckCircle } from 'lucide-react'
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
  assessments: [{ question: '', options: ['', '', '', ''], answer: '' }],
}

export default function Chapters() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ video: null, pdf: null })

  const videoInputRef = useRef(null)
  const pdfInputRef = useRef(null)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(emptyForm); setEditingId(null); setError(''); setUploadProgress({ video: null, pdf: null }) }

  // ─── Assessment helpers ───────────────────────────────────────────────────
  const addAssessment = () =>
    setForm(f => ({ ...f, assessments: [...f.assessments, { question: '', options: ['', '', '', ''], answer: '' }] }))

  const removeAssessment = (idx) =>
    setForm(f => ({ ...f, assessments: f.assessments.filter((_, i) => i !== idx) }))

  const setAssessmentField = (idx, field, value) =>
    setForm(f => {
      const assessments = f.assessments.map((a, i) => i === idx ? { ...a, [field]: value } : a)
      return { ...f, assessments }
    })

  const setAssessmentOption = (idx, optIdx, value) =>
    setForm(f => {
      const assessments = f.assessments.map((a, i) => {
        if (i !== idx) return a
        const options = a.options.map((o, oi) => oi === optIdx ? value : o)
        return { ...a, options }
      })
      return { ...f, assessments }
    })

  // ─── File upload helper ───────────────────────────────────────────────────
  const uploadFile = async (file, type) => {
    const fd = new FormData()
    fd.append('file', file)
    setUploadProgress(p => ({ ...p, [type]: 'uploading' }))
    try {
      const res = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setUploadProgress(p => ({ ...p, [type]: 'done' }))
      return data.url || data.fileUrl || data.path || null
    } catch (err) {
      setUploadProgress(p => ({ ...p, [type]: 'error' }))
      throw err
    }
  }

  // ─── Payload builder ──────────────────────────────────────────────────────
  const buildPayload = (videoUrl, pdfUrl) => ({
    code: form.chapterCode.trim(),
    title: form.chapterName.trim(),
    classLabel: form.className,
    courseId: form.courseId,
    subject: form.subjectName,
    orderIndex: editingId
      ? catalog.chapters.findIndex((item) => item.id === editingId) + 1
      : (catalog.chapters || []).length + 1,
    ...(videoUrl !== undefined && { videoUrl }),
    ...(pdfUrl !== undefined && { pdfUrl }),
    assessments: form.assessments
      .filter(a => a.question.trim())
      .map(a => ({ question: a.question.trim(), options: a.options, answer: a.answer })),
  })

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.chapterCode.trim()) { setError('Chapter Code is required'); return }
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      let videoUrl, pdfUrl
      if (form.videoFile) videoUrl = await uploadFile(form.videoFile, 'video')
      if (form.pdfFile) pdfUrl = await uploadFile(form.pdfFile, 'pdf')
      const data = await apiRequest('/admin/chapters', { method: 'POST', body: JSON.stringify(buildPayload(videoUrl, pdfUrl)) })
      setCatalog(prev => ({ ...prev, chapters: [...(prev.chapters || []), data.chapter] }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Edit click ───────────────────────────────────────────────────────────
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
        : [{ question: '', options: ['', '', '', ''], answer: '' }],
    })
    setError('')
    setUploadProgress({ video: null, pdf: null })
  }

  // ─── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!form.chapterName.trim()) { setError('Chapter Name is required'); return }
    if (!form.className) { setError('Class Name is required'); return }
    if (!form.subjectName) { setError('Subject Name is required'); return }
    setLoading(true)
    try {
      let videoUrl, pdfUrl
      if (form.videoFile) videoUrl = await uploadFile(form.videoFile, 'video')
      if (form.pdfFile) pdfUrl = await uploadFile(form.pdfFile, 'pdf')
      const data = await apiRequest(`/admin/chapters/${editingId}`, { method: 'PUT', body: JSON.stringify(buildPayload(videoUrl, pdfUrl)) })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.map(c => c.id === editingId ? data.chapter : c) }))
      reset()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await apiRequest(`/admin/chapters/${id}`, { method: 'DELETE' })
      setCatalog(prev => ({ ...prev, chapters: prev.chapters.filter(c => c.id !== id) }))
      if (editingId === id) reset()
    } catch (error) {
      setError(error.message)
    }
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
          {/* Video Upload */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter Video</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 10,
                padding: '18px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                background: form.videoFile ? 'rgba(108,99,255,0.06)' : 'transparent',
                transition: 'background 0.2s',
              }}
              onClick={() => videoInputRef.current?.click()}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={e => { set('videoFile', e.target.files[0] || null); setUploadProgress(p => ({ ...p, video: null })) }}
              />
              <FileVideo size={26} color={form.videoFile ? 'var(--accent)' : 'var(--text3)'} style={{ marginBottom: 6 }} />
              {form.videoFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, wordBreak: 'break-all' }}>{form.videoFile.name}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, lineHeight: 1 }}
                    onClick={e => { e.stopPropagation(); set('videoFile', null); setUploadProgress(p => ({ ...p, video: null })) }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload video <br /><span style={{ fontSize: 11 }}>MP4, MOV, AVI, etc.</span></p>
              )}
              <div style={{ marginTop: 4 }}><UploadBadge status={uploadProgress.video} /></div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Chapter PDF / Notes</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 10,
                padding: '18px 14px',
                textAlign: 'center',
                cursor: 'pointer',
                background: form.pdfFile ? 'rgba(0,212,170,0.06)' : 'transparent',
                transition: 'background 0.2s',
              }}
              onClick={() => pdfInputRef.current?.click()}
            >
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => { set('pdfFile', e.target.files[0] || null); setUploadProgress(p => ({ ...p, pdf: null })) }}
              />
              <FileText size={26} color={form.pdfFile ? '#00d4aa' : 'var(--text3)'} style={{ marginBottom: 6 }} />
              {form.pdfFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, wordBreak: 'break-all' }}>{form.pdfFile.name}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, lineHeight: 1 }}
                    onClick={e => { e.stopPropagation(); set('pdfFile', null); setUploadProgress(p => ({ ...p, pdf: null })) }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text3)', margin: 0 }}>Click to upload PDF / Notes <br /><span style={{ fontSize: 11 }}>PDF, DOC, DOCX</span></p>
              )}
              <div style={{ marginTop: 4 }}><UploadBadge status={uploadProgress.pdf} /></div>
            </div>
          </div>
        </div>

        {/* ── Row 5: Assessments ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClipboardList size={15} color="var(--accent)" /> Assessments / Quiz
            </label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={addAssessment}>
              <Plus size={13} /> Add Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {form.assessments.map((a, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '14px 14px 10px',
                  background: 'rgba(108,99,255,0.03)',
                  position: 'relative',
                }}
              >
                {/* Remove button */}
                {form.assessments.length > 1 && (
                  <button
                    type="button"
                    style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}
                    onClick={() => removeAssessment(idx)}
                  >
                    <X size={14} />
                  </button>
                )}

                <div style={{ marginBottom: 8 }}>
                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Q{idx + 1}. Question</label>
                  <input
                    className="input"
                    placeholder="Enter question"
                    value={a.question}
                    onChange={e => setAssessmentField(idx, 'question', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                  {a.options.map((opt, oi) => (
                    <div key={oi}>
                      <label className="form-label" style={{ fontSize: 11, marginBottom: 3 }}>Option {String.fromCharCode(65 + oi)}</label>
                      <input
                        className="input"
                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        value={opt}
                        onChange={e => setAssessmentOption(idx, oi, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: 12, marginBottom: 4 }}>Correct Answer</label>
                  <select
                    className="input"
                    value={a.answer}
                    onChange={e => setAssessmentField(idx, 'answer', e.target.value)}
                  >
                    <option value="">— Select correct option —</option>
                    {a.options.map((opt, oi) => opt.trim() && (
                      <option key={oi} value={opt}>{String.fromCharCode(65 + oi)}. {opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
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

      {/* ── Table ── */}
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
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEditClick(ch)} title="Edit this chapter"><Edit2 size={13} /> Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ch.id)} title="Delete this chapter"><Trash2 size={13} /> Delete</button>
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
