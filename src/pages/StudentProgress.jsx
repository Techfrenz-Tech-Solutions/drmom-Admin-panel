import { TrendingUp } from 'lucide-react'

export default function StudentProgress() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Student Progress</h1>
          <p>Track learning progress across all students</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <TrendingUp size={36} />
          <p>Student progress tracking coming soon.</p>
        </div>
      </div>
    </div>
  )
}
