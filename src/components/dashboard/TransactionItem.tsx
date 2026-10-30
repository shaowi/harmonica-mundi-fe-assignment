import type { Transaction } from '../../api/types'
import { formatMoney, formatShortDate } from '../../lib/format'
import { Badge } from '../ui/Badge'

export interface TransactionItemProps {
  transaction: Transaction
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIncoming = transaction.direction === 'in'
  const isPending = transaction.status === 'pending'

  // Format amount: positive money in with '+', money out formatted with formatMoney(-amount)
  // Candidate brief: "Money in: +SGD 45.00 in the positive colour. Money out: -SGD 86.40 in the normal text colour."
  const formattedAmount = isIncoming
    ? `+${formatMoney(transaction.amount)}`
    : formatMoney(-transaction.amount)

  return (
    <li className="transaction-item">
      <div className="transaction-main">
        <span className="transaction-desc">{transaction.description}</span>
        <div className="transaction-meta">
          <span className="transaction-category">{transaction.category}</span>
          <span className="transaction-separator" aria-hidden="true">
            ·
          </span>
          <time
            dateTime={transaction.date}
            className="transaction-date"
          >
            {formatShortDate(transaction.date)}
          </time>
        </div>
      </div>

      <div className="transaction-right">
        <span
          className={`transaction-amount amount ${
            isIncoming ? 'transaction-amount-in' : 'transaction-amount-out'
          }`}
        >
          {formattedAmount}
        </span>
        {isPending && <Badge variant="pending">Pending</Badge>}
      </div>
    </li>
  )
}

