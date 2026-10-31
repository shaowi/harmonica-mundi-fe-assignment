import type { TransferResponse } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'

export interface TransferSuccessProps {
  transferResponse: TransferResponse
  onClose: () => void
  onAnotherTransfer: () => void
}

export function TransferSuccess({
  transferResponse,
  onClose,
  onAnotherTransfer,
}: TransferSuccessProps) {
  const { transfer } = transferResponse

  const recipientString = `to ${transfer.recipient.name} · ${transfer.recipient.bank} · ${transfer.recipient.accountNumberMasked}`

  return (
    <div
      className="step-container step-success"
      aria-live="polite"
      role="status"
    >
      <div className="success-icon-wrap" aria-hidden="true">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h2 className="success-title">Transfer sent</h2>

      <div className="success-amount amount">
        {formatMoney(transfer.amount)}
      </div>

      <p className="success-recipient">{recipientString}</p>

      <div className="success-meta-card">
        <span className="meta-label">Reference</span>
        <span className="meta-val amount">{transfer.reference}</span>
      </div>

      <p className="success-caption">
        The money should arrive within minutes.
      </p>

      <div className="success-actions">
        <Button variant="primary" onClick={onClose} className="success-btn">
          Back to dashboard
        </Button>
        <Button
          variant="secondary"
          onClick={onAnotherTransfer}
          className="success-btn"
        >
          Make another transfer
        </Button>
      </div>
    </div>
  )
}

