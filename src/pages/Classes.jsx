import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react'

export default function Classes() {
  const { CLASSES, addClass, updateClass, deleteClass } = useApp()

  // Input fields above the table
  const [classCode, setClassCode] = useState('')
  const [className, setClassName] = useState('')
  const [editingIndex, setEditingIndex] = useState(null) // null = create mode, number = update mode
  const [error, setError] = useState('')

  // Build list with auto-generated codes if not stored
  const classList = CLASSES.map((name, i) => ({
    code: `CLS-${String(i + 1).padStart(3, '0')}`,
    name,
  }))

  const reset = () => {
    setClassCode('')
    setClassName('')
    setEditingIndex(null)
    setError('')
  }

  // Create handler
  const handleCreate = () => {
    const code = classCode.trim()
    const name = className.trim()
    if (!code) { setError('Class Code is required'); return }
    if (!name) { setError('Class Name is required'); return }
    if (CLASSES.includes(name)) { setError('Class already exists'); return }
    addClass(name)
    reset()
  }

  // Load row into inputs for update
  const handleEditClick = (index) => {
    setEditingIndex(index)
    setClassCode(classList[index].code)
    setClassName(classList[index].name)
    setError('')
  }

  // Update handler
  const handleUpdate = () => {
    const name = className.trim()
    if (!name) { setError('Class Name is required'); return }
    const original = classList[editingIndex].name
    if (name !== original && CLASSES.includes(name)) { setError('Class already exists'); return }
    updateClass(original, name)
    reset()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p>Manage class levels — changes reflect across chapters, videos, pricing &amp; users</p>
        </div>
      </div>

      {/* Input Row */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          {/* Class Code */}
          <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
            <label className="form-label">Class Code</label>
            <input
              className="input"
              placeholder="e.g. CLS-001"
              value={classCode}
              onChange={e => { setClassCode(e.target.value); setError('') }}
            />
          </div>

          {/* Class Name */}
          <div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
            <label className="form-label">Class Name</label>
            <input
              className="input"
              placeholder="e.g. 6th Standard"
              value={className}
              onChange={e => { setClassName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (editingIndex === null ? handleCreate() : handleUpdate())}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 10, paddingBottom: 0, alignItems: 'flex-end' }}>
            {editingIndex === null ? (
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

      {/* Table */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14 }}>
          All Classes
        </h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 50 }}>SI No</th>
                <th>Class Code</th>
                <th>Class Name</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {classList.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px 0' }}>
                    No classes found. Use the form above to create one.
                  </td>
                </tr>
              ) : (
                classList.map((cls, i) => (
                  <tr key={cls.name} style={{ background: editingIndex === i ? 'rgba(108,99,255,0.06)' : undefined }}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                        {cls.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <GraduationCap size={14} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{cls.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditClick(i)}
                          title="Edit this class"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteClass(cls.name)}
                          title="Delete this class"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
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
