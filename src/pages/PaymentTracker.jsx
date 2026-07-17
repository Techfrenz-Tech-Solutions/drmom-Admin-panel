import { Wallet } from 'lucide-react'

export default function PaymentTracker() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payment Tracker</h1>
          <p>Monitor all payment transactions</p>
        </div>
      </div>
      <div className="card">
        <div className="empty-state">
          <Wallet size={36} />
          <p>Payment tracker coming soon.</p>
        </div>
      </div>
    </div>
  )
}
