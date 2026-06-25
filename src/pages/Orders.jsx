import { useEffect, useState } from 'react'
import { ShoppingCart, Search } from 'lucide-react'
import { apiRequest } from '../utils/api'

const statusColor = { PAID: 'badge-green', CREATED: 'badge-blue', FAILED: 'badge-red', REFUNDED: 'badge-yellow' }

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/admin/orders')
      .then(data => setOrders(data.orders || []))
      .catch(err => setError(err.message))
  }, [])

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    if (q && !o.user?.name?.toLowerCase().includes(q) && !o.user?.email?.toLowerCase().includes(q) && !o.razorpayOrderId?.includes(q)) return false
    if (filterStatus && o.status !== filterStatus) return false
    return true
  })

  const totalRevenue = orders.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (o.amountInPaise || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} total orders · ₹{Math.round(totalRevenue / 100).toLocaleString('en-IN')} collected</p>
        </div>
      </div>

      {error && <div style={{ marginBottom: 12, color: 'var(--red)', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Search size={14} color="var(--text3)" />
          <input placeholder="Search name, email, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="PAID">Paid</option>
          <option value="CREATED">Created</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={36} /><p>No orders found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr key={o.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--accent)' }}>
                        {o.razorpayOrderId?.slice(0, 18) || o.id.slice(0, 12)}…
                      </span>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text)', fontWeight: 500 }}>{o.user?.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 13 }}>{o.course?.title || '—'}</td>
                    <td style={{ fontWeight: 700 }}>₹{Math.round((o.amountInPaise || 0) / 100)}</td>
                    <td><span className={`badge ${statusColor[o.status] || 'badge-blue'}`}>{o.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
