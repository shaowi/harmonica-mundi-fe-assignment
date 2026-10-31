import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { fetchPayees, submitTransfer } from '../../api/transfers'
import type { Account, CreateTransferRequest, TransferResponse } from '../../api/types'
import { StepAmount } from './StepAmount'
import { StepRecipient } from './StepRecipient'
import { StepReview } from './StepReview'
import { TransferStepper, type TransferStep } from './TransferStepper'
import { TransferSuccess } from './TransferSuccess'
import {
  createTransferSchema,
  type TransferFormValues,
} from './transferSchema'

import './TransferDialog.css'

export interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  depositAccounts: Account[]
  remainingDailyLimit: number
  openerElement?: HTMLElement | null
}

export function TransferDialog({
  isOpen,
  onClose,
  depositAccounts,
  remainingDailyLimit,
  openerElement,
}: TransferDialogProps) {
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState<TransferStep>(1)
  const [isSuccess, setIsSuccess] = useState(false)
  const [transferResponse, setTransferResponse] =
    useState<TransferResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Fetch payees
  const { data: payees = [] } = useQuery({
    queryKey: ['payees'],
    queryFn: fetchPayees,
    enabled: isOpen,
  })

  // Selected account for balance calculation
  const defaultAccountId = depositAccounts[0]?.id ?? ''

  // Initialize form
  const form = useForm<TransferFormValues>({
    mode: 'onBlur',
    defaultValues: {
      recipientType: 'saved',
      payeeId: '',
      newRecipient: {
        name: '',
        accountNumber: '',
        bank: '',
      },
      fromAccountId: defaultAccountId,
      amount: '',
      note: '',
    },
  })

  const watchedAccountId = useWatch({
    control: form.control,
    name: 'fromAccountId',
    defaultValue: defaultAccountId,
  })

  const selectedAccount =
    depositAccounts.find((a) => a.id === watchedAccountId) ??
    depositAccounts[0]
  const availableBalance = selectedAccount?.balance ?? 0

  // Dynamically update schema with current balance and limit
  const validationSchema = useMemo(
    () => createTransferSchema({ availableBalance, remainingDailyLimit }),
    [availableBalance, remainingDailyLimit],
  )

  // Set default payeeId once payees are loaded if not already selected
  useEffect(() => {
    if (payees.length > 0 && !form.getValues('payeeId')) {
      form.setValue('payeeId', payees[0].id)
    }
  }, [payees, form])

  // Reset dialog state when closed or reopened
  const handleReset = useCallback(() => {
    setCurrentStep(1)
    setIsSuccess(false)
    setTransferResponse(null)
    setIsSubmitting(false)
    setSendError(null)
    form.reset({
      recipientType: 'saved',
      payeeId: payees[0]?.id ?? '',
      newRecipient: {
        name: '',
        accountNumber: '',
        bank: '',
      },
      fromAccountId: depositAccounts[0]?.id ?? '',
      amount: '',
      note: '',
    })
  }, [form, payees, depositAccounts])

  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  // Keyboard navigation & Focus management (T1, T8)
  useEffect(() => {
    if (!isOpen) return

    // Move focus inside dialog
    const previousActiveElement =
      openerElement ?? (document.activeElement as HTMLElement | null)
    const timer = setTimeout(() => {
      dialogRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      // Restore focus to opener button
      if (previousActiveElement) {
        previousActiveElement.focus()
      }
    }
  }, [isOpen, handleClose, openerElement])

  // Step 1 -> Step 2 validation
  const handleStep1Continue = async () => {
    const values = form.getValues()
    const result = validationSchema.safeParse(values)

    if (!result.success) {
      const formattedErrors = result.error.format()

      if (values.recipientType === 'saved') {
        if (formattedErrors.payeeId?._errors?.length) {
          form.setError('payeeId', {
            message: formattedErrors.payeeId._errors[0],
          })
          document.querySelector<HTMLElement>('.payees-list-section')?.focus()
          return
        }
      } else {
        let hasError = false
        const nrErrors = formattedErrors.newRecipient

        if (nrErrors?.name?._errors?.length) {
          form.setError('newRecipient.name', {
            message: nrErrors.name._errors[0],
          })
          document.getElementById('new-recipient-name')?.focus()
          hasError = true
        }
        if (nrErrors?.accountNumber?._errors?.length) {
          form.setError('newRecipient.accountNumber', {
            message: nrErrors.accountNumber._errors[0],
          })
          if (!hasError) {
            document.getElementById('new-recipient-account')?.focus()
            hasError = true
          }
        }
        if (nrErrors?.bank?._errors?.length) {
          form.setError('newRecipient.bank', {
            message: nrErrors.bank._errors[0],
          })
          if (!hasError) {
            document.getElementById('new-recipient-bank')?.focus()
            hasError = true
          }
        }
        if (hasError) return
      }
    }

    setCurrentStep(2)
  }

  // Step 2 -> Step 3 validation
  const handleStep2Continue = async () => {
    const values = form.getValues()
    const result = validationSchema.safeParse(values)

    if (!result.success) {
      const formattedErrors = result.error.format()

      if (formattedErrors.fromAccountId?._errors?.length) {
        form.setError('fromAccountId', {
          message: formattedErrors.fromAccountId._errors[0],
        })
        document.getElementById('from-account-select')?.focus()
        return
      }

      if (formattedErrors.amount?._errors?.length) {
        form.setError('amount', {
          message: formattedErrors.amount._errors[0],
        })
        document.getElementById('transfer-amount')?.focus()
        return
      }

      if (formattedErrors.note?._errors?.length) {
        form.setError('note', {
          message: formattedErrors.note._errors[0],
        })
        document.getElementById('transfer-note')?.focus()
        return
      }
    }

    setCurrentStep(3)
  }

  // Confirm transfer execution (T5)
  const handleConfirmTransfer = async () => {
    setIsSubmitting(true)
    setSendError(null)

    const values = form.getValues()
    const amountNumber = Number(values.amount)

    const payload: CreateTransferRequest = {
      fromAccountId: values.fromAccountId,
      amount: amountNumber,
      note: values.note.trim() ? values.note.trim() : undefined,
    }

    if (values.recipientType === 'saved') {
      payload.payeeId = values.payeeId
    } else {
      payload.recipient = {
        name: values.newRecipient.name.trim(),
        accountNumber: values.newRecipient.accountNumber.trim(),
        bank: values.newRecipient.bank.trim(),
      }
    }

    try {
      const response = await submitTransfer(payload)

      // Invalidate queries so dashboard reflects updated balance and transactions (T6)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customer'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      ])

      setTransferResponse(response)
      setIsSuccess(true)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Your money hasn\'t left your account. Try again.'
      setSendError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="transfer-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose()
        }
      }}
    >
      <div
        ref={dialogRef}
        className="transfer-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-dialog-title"
        tabIndex={-1}
      >
        {/* Header with Title, Close, and Stepper */}
        {!isSuccess && (
          <div className="transfer-dialog-header">
            <div className="transfer-dialog-title-bar">
              <h1 id="transfer-dialog-title" className="transfer-dialog-title">
                New transfer
              </h1>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={handleClose}
                aria-label="Close transfer dialog"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>

            <TransferStepper currentStep={currentStep} />
          </div>
        )}

        {/* Step Contents */}
        <div className="transfer-dialog-body">
          {isSuccess && transferResponse ? (
            <TransferSuccess
              transferResponse={transferResponse}
              onClose={handleClose}
              onAnotherTransfer={handleReset}
            />
          ) : currentStep === 1 ? (
            <StepRecipient
              form={form}
              payees={payees}
              onContinue={handleStep1Continue}
              onCancel={handleClose}
            />
          ) : currentStep === 2 ? (
            <StepAmount
              form={form}
              depositAccounts={depositAccounts}
              remainingDailyLimit={remainingDailyLimit}
              onContinue={handleStep2Continue}
              onBack={() => setCurrentStep(1)}
            />
          ) : (
            <StepReview
              formData={form.getValues()}
              depositAccounts={depositAccounts}
              payees={payees}
              isSubmitting={isSubmitting}
              sendError={sendError}
              onConfirm={handleConfirmTransfer}
              onBack={() => {
                setSendError(null)
                setCurrentStep(2)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
