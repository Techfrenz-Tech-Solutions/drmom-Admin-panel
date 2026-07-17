import { Mail } from 'lucide-react'

export default function Newsletter() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Newsletter</h1>
          <p>Manage and send newsletters to subscribers</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <Mail size={36} />
          <p>Newsletter management coming soon.</p>
        </div>
      </div>
    </div>
  )
}
