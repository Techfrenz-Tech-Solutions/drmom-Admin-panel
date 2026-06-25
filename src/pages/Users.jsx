import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, Search, Users, ToggleLeft, ToggleRight } from 'lucide-react'
import Modal from '../components/Modal'
import { apiRequest } from '../utils/api'
import { classNames, loadAdminCatalog } from '../utils/adminData'

const empty = { name: '', email: '', password: '', phone: '', gradeLabel: '', role: 'USER', isActive: true }

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [classes, setClasses] = useState([])
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [confirmDel, setConfirmDel] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    const [userData, catalog] = await Promise.all([apiRequest('/admin/users'), loadAdminCatalog()])
    setUsers(userData.users || [])
    setClasses(classNames(catalog))
  }

  useEffect(() => { load().catch((error) => setError(error.message)) }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.phone || '').includes(q)) return false
    if (filterClass && u.gradeLabel !== filterClass) return false
    if (filterStatus && (u.isActive ? 'active' : 'inactive') !== filterStatus) return false
    return true
  })

  const openAdd = () => { setForm(empty); setModal('add'); setError('') }
  const openEdit = (u) => { setForm({ ...empty, ...u, password: '' }); setModal({ edit: u }); setError('') }
  const close = () => setModal(null)

  const save = async () => {
    if (!form.name || !form.email) return setError('Name and email are required')
    const body = {
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      gradeLabel: form.gradeLabel || '',
      role: form.role || 'USER',
      isActive: Boolean(form.isActive),
      ...(form.password ? { password: form.password } : {}),
    }
    try {
      if (modal === 'add') {
        const data = await apiRequest('/admin/users', { method: 'POST', body: JSON.stringify({ ...body, password: form.password || 'ChangeThis123!' }) })
        setUsers(prev => [data.user, ...prev])
      } else {
        const data = await apiRequest(`/admin/users/${modal.edit.id}`, { method: 'PUT', body: JSON.stringify(body) })
        setUsers(prev => prev.map(u => u.id === modal.edit.id ? data.user : u))
      }
      close()
    } catch (error) {
      setError(error.message)
    }
  }

  const toggleStatus = async (u) => {
    const body = { name: u.name, email: u.email, phone: u.phone || '', gradeLabel: u.gradeLabel || '', role: u.role, isActive: !u.isActive }
    try {
      const data = await apiRequest(`/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify(body) })
      setUsers(prev => prev.map(item => item.id === u.id ? data.user : item))
    } catch (error) {
      setError(error.message)
    }
  }

  const deleteUser = async (id) => {
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' })
      setUsers(prev => prev.filter(u => u.id !== id))
      setConfirmDel(null)
    } catch (error) {
      setError(error.message)
    }
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const initials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const COLORS = ['#6c63ff', '#ff6b9d', '#00d4aa', '#ffa94d', '#4dabf7']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>{users.length} users — {users.filter(u => u.isActive).length} active</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add User</button>
      </div>

      {error && <div style={{ marginBottom: 12, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar"><Search size={14} color="var(--text3)" /><input placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="input" style={{ width: 'auto' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>User</th><th>Phone</th><th>Class</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><Users size={32} /><p>No users found</p></div></td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: COLORS[i % COLORS.length] + '33', border: `2px solid ${COLORS[i % COLORS.length]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: COLORS[i % COLORS.length] }}>{initials(u.name)}</div>
                      <div><div style={{ color: 'var(--text)', fontWeight: 500 }}>{u.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{u.email}</div></div>
                    </div>
                  </td>
                  <td>{u.phone || '-'}</td>
                  <td><span className="badge badge-blue">{u.gradeLabel || '-'}</span></td>
                  <td><span className="badge badge-yellow">{u.role}</span></td>
                  <td style={{ fontSize: 12 }}>{new Date(u.createdAt).toISOString().slice(0, 10)}</td>
                  <td>
                    <button onClick={() => toggleStatus(u)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: 0 }}>
                      {u.isActive ? <><ToggleRight size={20} color="var(--green)" /><span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Active</span></> : <><ToggleLeft size={20} color="var(--text3)" /><span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>Inactive</span></>}
                    </button>
                  </td>
                  <td><div className="action-btns"><button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}><Edit2 size={13} /></button><button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(u)}><Trash2 size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add User' : 'Edit User'} onClose={close} footer={<><button className="btn btn-ghost" onClick={close}>Cancel</button><button className="btn btn-primary" onClick={save}>Save User</button></>}>
          <div className="form-group"><label className="form-label">Full Name *</label><input className="input" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="input" type="email" placeholder="user@example.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Password {modal === 'add' ? '*' : '(leave blank to keep)'}</label><input className="input" type="password" placeholder="At least 8 characters" value={form.password} onChange={e => set('password', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Phone</label><input className="input" placeholder="9876543210" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group"><label className="form-label">Class</label><select className="input" value={form.gradeLabel || ''} onChange={e => set('gradeLabel', e.target.value)}><option value="">Select class</option>{classes.map(c => <option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Role</label><select className="input" value={form.role} onChange={e => set('role', e.target.value)}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Status</label><select className="input" value={form.isActive ? 'active' : 'inactive'} onChange={e => set('isActive', e.target.value === 'active')}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        </Modal>
      )}

      {confirmDel && (
        <Modal title="Delete User" onClose={() => setConfirmDel(null)} footer={<><button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>Cancel</button><button className="btn btn-danger" onClick={() => deleteUser(confirmDel.id)}>Delete</button></>}>
          <p style={{ color: 'var(--text2)' }}>Delete user <strong style={{ color: 'var(--text)' }}>{confirmDel.name}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  )
}
