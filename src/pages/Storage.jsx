import { HardDrive } from 'lucide-react'

export default function Storage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Storage</h1>
          <p>Manage media files and storage usage</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <HardDrive size={36} />
          <p>Storage management coming soon.</p>
        </div>
      </div>
    </div>
  )
}
