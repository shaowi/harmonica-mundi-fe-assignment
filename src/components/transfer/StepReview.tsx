import type { Account, Payee } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'
import type { TransferFormValues } from './transferSchema'

export interface StepReviewProps {
  formData: TransferFormValues
  depositAccounts: Account[]
  payees: Payee[]
  isSubmitting: boolean
  sendError: string | null
  onConfirm: () => void
  onBack: () => void
}

export function StepReview({
  formData,
  depositAccounts,
  payees,
  isSubmitting,
  sendError,
  onConfirm,
  onBack,
}: StepReviewProps) {
  const account = depositAccounts.find((a) => a.id === formData.fromAccountId)

  // Determine recipient details
  let recipientName = ''
  let recipientDetails = ''

  if (formData.recipientType === 'saved') {
    const payee = payees.find((p) => p.id === formData.payeeId)
    recipientName = payee?.name ?? 'Unknown Payee'
    recipientDetails = payee ? `${payee.bank} · ${payee.accountNumberMasked}` : ''
  } else {
    recipientName = formData.newRecipient?.name ?? ''
    const acc = formData.newRecipient?.accountNumber ?? ''
    const masked = acc.length >= 4 ? `•••• ${acc.slice(-4)}` : acc
    recipientDetails = `${formData.newRecipient?.bank} · ${masked}`
  }

  const numericAmount = Number(formData.amount) || 0
  const formattedAmount = formatMoney(numericAmount)

  return (
    <div className="step-container step-review">
      <h2 className="step-title">Check the details</h2>

      {/* API error alert if submission failed */}
      {sendError && (
        <div className="send-error-alert" role="alert">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{sendError}</span>
        </div>
      )}

      {/* Review Summary Card */}
      <div className="review-summary-card">
        <div className="review-row">
          <span className="review-label">From</span>
          <span className="review-val">
            {account?.name} · {account?.maskedNumber}
          </span>
        </div>

        <div className="review-row">
          <span className="review-label">To</span>
          <span className="review-val">
            <strong>{recipientName}</strong>
            <span className="review-sub">{recipientDetails}</span>
          </span>
        </div>

        <div className="review-row">
          <span className="review-label">Amount</span>
          <span className="review-val amount">{formattedAmount}</span>
        </div>

        <div className="review-row">
          <span className="review-label">Fee</span>
          <span className="review-val amount">SGD 0.00</span>
        </div>

        {formData.note && (
          <div className="review-row">
            <span className="review-label">Note</span>
            <span className="review-val">{formData.note}</span>
          </div>
        )}

        <div className="review-divider" />

        <div className="review-row review-row-total">
          <span className="review-label">Total</span>
          <span className="review-val amount total-amount">
            {formattedAmount}
          </span>
        </div>
      </div>

      {/* Arrival Info Notice */}
      <div className="arrival-notice">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Usually arrives in minutes.</span>
      </div>

      {/* Footer Actions */}
      <div className="dialog-footer">
        <Button variant="secondary" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Confirm transfer'}
        </Button>
      </div>
    </div>
  )
}

