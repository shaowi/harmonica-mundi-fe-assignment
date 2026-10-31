import type { UseFormReturn } from 'react-hook-form';
import type { Account } from '../../api/types';
import { formatMoney } from '../../lib/format';
import { Button } from '../ui/Button';
import type { TransferFormValues } from './transferSchema';

export interface StepAmountProps {
  form: UseFormReturn<TransferFormValues>;
  depositAccounts: Account[];
  remainingDailyLimit: number;
  onContinue: () => void;
  onBack: () => void;
}

const PRESET_AMOUNTS = [50, 100, 250, 500];

export function StepAmount({
  form,
  depositAccounts,
  remainingDailyLimit,
  onContinue,
  onBack
}: StepAmountProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors }
  } = form;

  const selectedAccountId = watch('fromAccountId');
  const currentAmount = watch('amount') ?? '';
  const note = watch('note') ?? '';

  const selectedAccount =
    depositAccounts.find((acc) => acc.id === selectedAccountId) ??
    depositAccounts[0];

  const availableBalance = selectedAccount?.balance ?? 0;

  const handlePresetClick = (val: number) => {
    setValue('amount', val.toFixed(2), {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  return (
    <div className="step-container step-amount">
      <h2 className="step-title">How much?</h2>

      {/* From Account selector */}
      <div className="form-field">
        <label htmlFor="from-account-select">From account</label>
        <select
          id="from-account-select"
          aria-invalid={!!errors.fromAccountId}
          aria-describedby="from-account-caption"
          {...register('fromAccountId', {
            onChange: (e) => {
              setValue('fromAccountId', e.target.value, {
                shouldValidate: true
              });
            }
          })}
        >
          {depositAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.maskedNumber} (
              {formatMoney(account.balance)})
            </option>
          ))}
        </select>
        <span id="from-account-caption" className="field-caption">
          Deposit accounts only
        </span>
        {errors.fromAccountId && (
          <p id="from-account-error" className="field-error" role="alert">
            {errors.fromAccountId.message}
          </p>
        )}
      </div>

      {/* Amount input */}
      <div className="form-field">
        <label htmlFor="transfer-amount">Amount</label>
        <div className="amount-input-group">
          <span className="currency-prefix" aria-hidden="true">
            SGD
          </span>
          <input
            id="transfer-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            className="amount-input amount"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            {...register('amount')}
          />
        </div>

        {/* Quick Presets */}
        <div
          className="preset-buttons"
          role="group"
          aria-label="Preset amount shortcuts"
        >
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              className={`preset-btn ${
                currentAmount === val.toFixed(2) ||
                currentAmount === String(val)
                  ? 'active'
                  : ''
              }`}
              onClick={() => handlePresetClick(val)}
            >
              {val}
            </button>
          ))}
        </div>

        {/* Balances & Limit Helper Texts */}
        <div className="amount-limits-info">
          <div className="limit-row">
            <span className="limit-label">Available</span>
            <span className="limit-val amount">
              {formatMoney(availableBalance)}
            </span>
          </div>
          <div className="limit-row">
            <span className="limit-label">Remaining daily limit</span>
            <span className="limit-val amount">
              {formatMoney(remainingDailyLimit)}
            </span>
          </div>
        </div>

        {errors.amount && (
          <p id="amount-error" className="field-error" role="alert">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* Note input */}
      <div className="form-field">
        <div className="field-label-row">
          <label htmlFor="transfer-note">Note (optional)</label>
          <span className="char-counter" aria-live="polite">
            {note.length}/50
          </span>
        </div>
        <input
          id="transfer-note"
          type="text"
          maxLength={50}
          placeholder="What's this for?"
          aria-invalid={!!errors.note}
          aria-describedby={errors.note ? 'note-error' : undefined}
          {...register('note')}
        />
        {errors.note && (
          <p id="note-error" className="field-error" role="alert">
            {errors.note.message}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <div className="dialog-footer">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
