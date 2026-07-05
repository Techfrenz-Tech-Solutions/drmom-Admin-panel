import { useEffect, useState } from 'react'
import {
  DollarSign, BookOpen, Layers, GraduationCap, BookMarked,
  Edit2, Trash2, Tag, ChevronDown, ChevronUp,
} from 'lucide-react'
import { apiRequest } from '../utils/api'
import {
  classNames, loadAdminCatalog,
  paiseToRupees, rupeesToPaise, subjectNames,
} from '../utils/adminData'

// ─── Sell Individual sub-form state ────────────────────────────────────────
// Only 'course' (real checkout price) and 'chapter' (display/reference price
// only — chapters are not sold separately) are supported here. Class/Subject
// pricing has no checkout path downstream, so it isn't offered.
const emptyIndividual = {
  type: '',          // 'course' | 'chapter'
  className: '',
  subjectName: '',
  courseId: '',
  chapterId: '',
  amount: '',
}

// ─── Main form state ────────────────────────────────────────────────────────
const EMPTY = {
  className: '', subjectName: '', courseId: '', amount: '',
}

export default function Prices() {
  const [catalog, setCatalog] = useState({ classes: [], subjects: [], chapters: [], courses: [] })
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Sell Individual state
  const [sellOpen, setSellOpen] = useState(false)          // whole section open/closed
  const [indiv, setIndiv] = useState(emptyIndividual)
  const [indivError, setIndivError] = useState('')
  const [indivLoading, setIndivLoading] = useState(false)

  const load = async () => setCatalog(await loadAdminCatalog())
  useEffect(() => { load().catch((e) => setError(e.message)) }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = () => { setForm(EMPTY); setEditing(null); setError('') }

  const setInd = (k, v) => setIndiv(f => ({ ...f, [k]: v }))
  const resetIndiv = () => { setIndiv(emptyIndividual); setIndivError('') }

  // ─── Catalog helpers ────────────────────────────────────────────────────
  const courses = catalog.courses || []

  const filteredCourses = courses.filter(c =>
    (!form.className || c.classLabel === form.className) &&
    (!form.subjectName || c.subject === form.subjectName)
  )

  // Filtered catalogs for individual sub-form
  const indivCourses = courses.filter(c =>
    (!indiv.className || c.classLabel === indiv.className) &&
    (!indiv.subjectName || c.subject === indiv.subjectName)
  )
  const indivChapters = (catalog.chapters || []).filter(c =>
    (!indiv.className || c.classLabel === indiv.className) &&
    (!indiv.subjectName || c.subject === indiv.subjectName) &&
    (!indiv.courseId || c.courseId === indiv.courseId)
  )

  // ─── Main form submit ───────────────────────────────────────────────────
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
      await apiRequest(`/admin/courses/${form.courseId}/price`, { method: 'PATCH', body: JSON.stringify({ priceInPaise }) })
      await load()
      reset()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Sell Individual submit ─────────────────────────────────────────────
  const handleIndivSubmit = async () => {
    if (!indiv.type) { setIndivError('Select a type first'); return }
    if (!indiv.amount || isNaN(indiv.amount) || Number(indiv.amount) < 0) { setIndivError('Valid amount is required'); return }

    if (indiv.type === 'course' && !indiv.courseId) { setIndivError('Select a course'); return }
    if (indiv.type === 'chapter' && !indiv.chapterId) { setIndivError('Select a chapter'); return }

    setIndivLoading(true)
    try {
      const priceInPaise = rupeesToPaise(indiv.amount)
      const body = JSON.stringify({ priceInPaise })

      if (indiv.type === 'course') {
        await apiRequest(`/admin/courses/${indiv.courseId}/price`, { method: 'PATCH', body })
      } else if (indiv.type === 'chapter') {
        await apiRequest(`/admin/chapters/${indiv.chapterId}/price`, { method: 'PATCH', body })
      }
      await load()
      resetIndiv()
    } catch (e) {
      setIndivError(e.message)
    } finally {
      setIndivLoading(false)
    }
  }

  // ─── Edit / Delete ──────────────────────────────────────────────────────
  const handleEditCourse = (course) => {
    setEditing({ type: 'course', id: course.id })
    setForm({ className: course.classLabel || '', subjectName: course.subject || '', courseId: course.id, amount: String(paiseToRupees(course.priceInPaise)) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete price for "${p.title}"?`)) return
    try {
      await apiRequest(`/admin/courses/${p.course.id}/price`, { method: 'DELETE' })
      await load()
      if (editing?.id === p.course?.id) reset()
    } catch (e) {
      setError(e.message)
    }
  }

  const priceCards = courses.map(course => ({
    id: `course-${course.id}`, type: 'Course', course, amount: paiseToRupees(course.priceInPaise),
    title: course.title, className: course.classLabel, subjectName: course.subject,
  }))

  // ─── Checkbox pill style ────────────────────────────────────────────────
  const TypeCheckbox = ({ value, label, icon: Icon }) => {
    const active = indiv.type === value
    return (
      <label style={{
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        padding: '8px 16px', borderRadius: 24,
        border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'rgba(94,61,143,0.1)' : 'transparent',
        fontWeight: 600, fontSize: 13, color: active ? 'var(--accent)' : 'var(--text2)',
        transition: 'all 0.18s', userSelect: 'none',
      }}>
        <input
          type="checkbox"
          checked={active}
          style={{ display: 'none' }}
          onChange={() => {
            setIndiv({ ...emptyIndividual, type: active ? '' : value })
            setIndivError('')
          }}
        />
        <Icon size={14} />
        {label}
      </label>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Pricing Plans</h1>
          <p>Set the real checkout price for each course. Chapter pricing shown below is display-only.</p>
        </div>
      </div>

      {/* ── Sell Individual Section ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 20 }}>

        {/* Toggle header */}
        <button
          type="button"
          style={{
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 0,
          }}
          onClick={() => { setSellOpen(o => !o); resetIndiv() }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(94,61,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={16} color="var(--accent)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Sell Individual</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>Set a real price for a course, or a display-only reference price for a chapter</div>
            </div>
          </div>
          {sellOpen
            ? <ChevronUp size={18} color="var(--text3)" />
            : <ChevronDown size={18} color="var(--text3)" />}
        </button>

        {/* Collapsible body */}
        {sellOpen && (
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 18 }}>

            {/* Four type checkboxes */}
            <div style={{ marginBottom: 18 }}>
              <label className="form-label" style={{ marginBottom: 10 }}>Select Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <TypeCheckbox value="course"  label="Course"  icon={BookOpen} />
                <TypeCheckbox value="chapter" label="Chapter" icon={Layers} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                Class and Subject pricing aren't offered here — there's no separate checkout for a
                whole class or subject, only for individual Courses.
              </p>
            </div>

            {/* ── Course selected ── */}
            {indiv.type === 'course' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
                    <select className="input" value={indiv.className} onChange={e => { setInd('className', e.target.value); setInd('courseId', ''); setIndivError('') }}>
                      <option value="">— All Classes —</option>
                      {classNames(catalog).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Subject <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
                    <select className="input" value={indiv.subjectName} onChange={e => { setInd('subjectName', e.target.value); setInd('courseId', ''); setIndivError('') }}>
                      <option value="">— All Subjects —</option>
                      {subjectNames(catalog).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Course</label>
                    <select className="input" value={indiv.courseId} onChange={e => { setInd('courseId', e.target.value); setIndivError('') }}>
                      <option value="">— Select Course —</option>
                      {indivCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Price (₹)</label>
                    <input className="input" type="number" min="0" placeholder="e.g. 799" value={indiv.amount} onChange={e => { setInd('amount', e.target.value); setIndivError('') }} />
                  </div>
                </div>
              </>
            )}

            {/* ── Chapter selected ── */}
            {indiv.type === 'chapter' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
                    <select className="input" value={indiv.className} onChange={e => { setInd('className', e.target.value); setInd('courseId', ''); setInd('chapterId', ''); setIndivError('') }}>
                      <option value="">— All Classes —</option>
                      {classNames(catalog).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Subject <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
                    <select className="input" value={indiv.subjectName} onChange={e => { setInd('subjectName', e.target.value); setInd('courseId', ''); setInd('chapterId', ''); setIndivError('') }}>
                      <option value="">— All Subjects —</option>
                      {subjectNames(catalog).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chapter</label>
                    <select className="input" value={indiv.chapterId} onChange={e => { setInd('chapterId', e.target.value); setIndivError('') }}>
                      <option value="">— Select Chapter —</option>
                      {indivChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Chapter display price (₹)</label>
                    <input className="input" type="number" min="0" placeholder="e.g. 149" value={indiv.amount} onChange={e => { setInd('amount', e.target.value); setIndivError('') }} />
                    <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
                      Reference price only — shown on chapter/video cards. There is no separate
                      checkout for a single chapter; students purchase the whole Course.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Submit / Cancel for individual */}
            {indiv.type && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button className="btn btn-primary" onClick={handleIndivSubmit} disabled={indivLoading}>
                  {indivLoading ? 'Saving…' : 'Submit'}
                </button>
                <button className="btn btn-ghost" onClick={resetIndiv}>Cancel</button>
                {indivError && <span style={{ color: 'var(--red)', fontSize: 13 }}>{indivError}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Main Pricing Form ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(94,61,143,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Set Course Price</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>This is the real checkout price students pay to buy a course</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Class Name <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
            <select className="input" value={form.className} onChange={e => { set('className', e.target.value); set('courseId', ''); setError('') }}>
              <option value="">— All Classes —</option>
              {classNames(catalog).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Subject Name <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional filter)</span></label>
            <select className="input" value={form.subjectName} onChange={e => { set('subjectName', e.target.value); set('courseId', ''); setError('') }}>
              <option value="">— All Subjects —</option>
              {subjectNames(catalog).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Course Name</label>
            <select className="input" value={form.courseId} onChange={e => { set('courseId', e.target.value); setError('') }}>
              <option value="">— Select Course —</option>
              {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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

      {/* ── Price Cards ──────────────────────────────────────────────────── */}
      {priceCards.length === 0 ? (
        <div className="card">
          <div className="empty-state"><DollarSign size={36} /><p>No pricing records yet. Create a course first.</p></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {priceCards.map(p => (
            <div key={p.id} className="card" style={{ borderTop: `3px solid ${editing?.id === p.course?.id ? 'var(--yellow, #ffd43b)' : 'var(--accent)'}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, fontWeight: 800, color: 'var(--accent)' }}>₹{p.amount}</div>
                <span className="badge badge-green">{p.type}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: GraduationCap, label: 'Class',   value: p.className || '-' },
                  { icon: BookMarked,   label: 'Subject', value: p.subjectName || '-' },
                  { icon: BookOpen,     label: 'Course',  value: p.course?.title || p.title },
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
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleEditCourse(p.course)}>
                  <Edit2 size={13} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>
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
