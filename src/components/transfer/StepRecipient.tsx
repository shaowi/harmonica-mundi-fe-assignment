import { useMemo, useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { Payee } from '../../api/types'
import { Button } from '../ui/Button'
import type { TransferFormValues } from './transferSchema'

export interface StepRecipientProps {
  form: UseFormReturn<TransferFormValues>
  payees: Payee[]
  onContinue: () => void
  onCancel: () => void
}

const SG_BANKS = [
  'DBS',
  'OCBC',
  'UOB',
  'POSB',
  'Standard Chartered',
  'Citibank',
  'HSBC',
]

export function StepRecipient({
  form,
  payees,
  onContinue,
  onCancel,
}: StepRecipientProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const recipientType = watch('recipientType')
  const selectedPayeeId = watch('payeeId')

  const filteredPayees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return payees
    return payees.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.bank.toLowerCase().includes(q),
    )
  }, [payees, searchQuery])

  const handleSelectPayee = (payeeId: string) => {
    setValue('recipientType', 'saved', { shouldValidate: true })
    setValue('payeeId', payeeId, { shouldValidate: true })
  }

  const handleSelectNew = () => {
    setValue('recipientType', 'new', { shouldValidate: true })
  }

  return (
    <div className="step-container step-recipient">
      <h2 className="step-title">Who are you sending to?</h2>

      {/* Payee Search */}
      <div className="payee-search-wrap">
        <label htmlFor="payee-search" className="sr-only">
          Search payees
        </label>
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="payee-search"
            type="search"
            className="search-input"
            placeholder="Search payees"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Payees List */}
      <div
        className="payees-list-section"
        role="radiogroup"
        aria-label="Saved payees"
      >
        {filteredPayees.map((payee) => {
          const isSelected =
            recipientType === 'saved' && selectedPayeeId === payee.id

          return (
            <div
              key={payee.id}
              className={`payee-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectPayee(payee.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  handleSelectPayee(payee.id)
                }
              }}
            >
              <div className="payee-radio" aria-hidden="true">
                <div
                  className={`radio-circle ${isSelected ? 'checked' : ''}`}
                />
              </div>

              <div className="payee-avatar" aria-hidden="true">
                {payee.initials}
              </div>

              <div className="payee-info">
                <span className="payee-name">{payee.name}</span>
                <span className="payee-details">
                  {payee.bank} · {payee.accountNumberMasked}
                </span>
              </div>
            </div>
          )
        })}

        {filteredPayees.length === 0 && (
          <p className="no-payees-msg">No payees match your search.</p>
        )}

        {errors.payeeId && recipientType === 'saved' && (
          <p
            id="payeeId-error"
            className="field-error"
            role="alert"
          >
            {errors.payeeId.message}
          </p>
        )}
      </div>

      {/* Send to someone new disclosure */}
      <div className="new-recipient-section">
        <button
          type="button"
          className={`new-recipient-toggle ${
            recipientType === 'new' ? 'active' : ''
          }`}
          onClick={handleSelectNew}
          aria-expanded={recipientType === 'new'}
          aria-controls="new-recipient-fields"
        >
          <div className="new-recipient-toggle-left">
            <span className="plus-icon" aria-hidden="true">
              +
            </span>
            <span>Send to someone new</span>
          </div>
          <span className="chevron-icon" aria-hidden="true">
            {recipientType === 'new' ? '▾' : '›'}
          </span>
        </button>

        {recipientType === 'new' && (
          <div
            id="new-recipient-fields"
            className="new-recipient-fields"
          >
            <div className="form-field">
              <label htmlFor="new-recipient-name">Recipient name</label>
              <input
                id="new-recipient-name"
                type="text"
                placeholder="Full name as registered"
                autoComplete="name"
                aria-invalid={!!errors.newRecipient?.name}
                aria-describedby={
                  errors.newRecipient?.name ? 'new-name-error' : undefined
                }
                {...register('newRecipient.name')}
              />
              {errors.newRecipient?.name && (
                <p id="new-name-error" className="field-error" role="alert">
                  {errors.newRecipient.name.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="new-recipient-account">
                Account number (8 digits)
              </label>
              <input
                id="new-recipient-account"
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="e.g. 12345678"
                aria-invalid={!!errors.newRecipient?.accountNumber}
                aria-describedby={
                  errors.newRecipient?.accountNumber
                    ? 'new-account-error'
                    : undefined
                }
                {...register('newRecipient.accountNumber')}
              />
              {errors.newRecipient?.accountNumber && (
                <p
                  id="new-account-error"
                  className="field-error"
                  role="alert"
                >
                  {errors.newRecipient.accountNumber.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="new-recipient-bank">Bank</label>
              <select
                id="new-recipient-bank"
                aria-invalid={!!errors.newRecipient?.bank}
                aria-describedby={
                  errors.newRecipient?.bank ? 'new-bank-error' : undefined
                }
                {...register('newRecipient.bank')}
              >
                <option value="">Choose a bank</option>
                {SG_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.newRecipient?.bank && (
                <p id="new-bank-error" className="field-error" role="alert">
                  {errors.newRecipient.bank.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="dialog-footer">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}

