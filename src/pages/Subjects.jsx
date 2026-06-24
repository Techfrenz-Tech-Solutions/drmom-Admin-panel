import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { BookMarked, Plus, Edit2, Trash2 } from 'lucide-react'

const EMPTY = { subjectCode: '', subjectName: '', className: '' }

export default function Subjects() {
  const { CLASSES, SUBJECTS, addSubject, updateSubject, deleteSubject } = useApp()

  // Local subject list with codes (SUBJECTS from context are just name strings)
  // We maintain a richer list locally
  const [subjectList, setSubjectList] = useState(
    SUBJECTS.map((name, i) => ({
      id: i + 1,
      code: `SUB-${String(i + 1).padStart(3, '0')}`,
      name,
      className: '',
    }))
  )
  const [nextId, setNextId] = useState(SUBJECTS.length + 1)

  const [form, setForm]         = useState(EMPTY)
  const [editingId, setEditingId] = useState(null)   // null = create mode
  const [error, setError]       = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const reset = () => { setForm(EMPTY); setEditingId(null); setError('') }

  /* ---------- Create ---------- */
  const handleCreate = () => {
    const { subjectCode, subjectName, className } = form
    if (!subjectCode.trim()) { setError('Subject Code is required'); return }
    if (!subjectName.trim()) { setError('Subject Name is required'); return }
    if (!className)          { setError('Class Name is required');   return }

    const name = subjectName.trim()
    addSubject(name)                       // sync to context
    setSubjectList(prev => [
      ...prev,
      { id: nextId, code: subjectCode.trim(), name, className },
    ])
    setNextId(n => n + 1)
    reset()
  }

  /* ---------- Load row for update ---------- */
  const handleEditClick = (s) => {
    setEditingId(s.id)
    setForm({ subjectCode: s.code, subjectName: s.name, className: s.className })
    setError('')
  }

  /* ---------- Update ---------- */
  const handleUpdate = () => {
    const { subjectCode, subjectName, className } = form
    if (!subjectName.trim()) { setError('Subject Name is required'); return }
    if (!className)          { setError('Class Name is required');   return }

    const original = subjectList.find(s => s.id === editingId)
    if (original && original.name !== subjectName.trim()) {
      updateSubject(original.name, subjectName.trim())   // sync rename to context
    }

    setSubjectList(prev =>
      prev.map(s =>
        s.id === editingId
          ? { ...s, code: subjectCode.trim(), name: subjectName.trim(), className }
          : s
      )
    )
    reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Subjects</h1>
          <p>Manage all subjects available in the platform</p>
        </div>
      </div>

      {/* ── Input Form ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>

          {/* Subject Code */}
          <div className="form-group" style={{ flex: '1 1 150px', marginBottom: 0 }}>
            <label className="form-label">Subject Code</label>
            <input
              className="input"
              placeholder="e.g. SUB-001"
              value={form.subjectCode}
              onChange={e => { set('subjectCode', e.target.value); setError('') }}
            />
          </div>

          {/* Subject Name */}
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Subject Name</label>
            <input
              className="input"
              placeholder="e.g. Mathematics"
              value={form.subjectName}
              onChange={e => { set('subjectName', e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (editingId === null ? handleCreate() : handleUpdate())}
            />
          </div>

          {/* Class Name Dropdown */}
          <div className="form-group" style={{ flex: '1 1 160px', marginBottom: 0 }}>
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

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: 10, color: 'var(--red)', fontSize: 13 }}>{error}</div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>
          All Subjects
        </h3>

        {subjectList.length === 0 ? (
          <div className="empty-state">
            <BookMarked size={36} />
            <p>No subjects found. Use the form above to create one.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 50 }}>SI No</th>
                  <th>Subject Code</th>
                  <th>Subject Name</th>
                  <th>Class Name</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjectList.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{ background: editingId === s.id ? 'rgba(108,99,255,0.06)' : undefined }}
                  >
                    {/* SI No */}
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>

                    {/* Subject Code */}
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {s.code}
                      </span>
                    </td>

                    {/* Subject Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookMarked size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>

                    {/* Class Name */}
                    <td>
                      {s.className
                        ? <span className="badge badge-blue">{s.className}</span>
                        : <span style={{ color: 'var(--text3)' }}>—</span>
                      }
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(s)}
                          title="Edit this subject"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            deleteSubject(s.name)
                            setSubjectList(prev => prev.filter(x => x.id !== s.id))
                            if (editingId === s.id) reset()
                          }}
                          title="Delete this subject"
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
