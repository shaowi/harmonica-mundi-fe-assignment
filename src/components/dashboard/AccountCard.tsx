import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { Badge } from '../ui/Badge'

export interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  const isCredit = account.type === 'credit'

  return (
    <article className="account-card" aria-labelledby={`acc-name-${account.id}`}>
      <div className="account-card-header">
        <h3 id={`acc-name-${account.id}`} className="account-card-name">
          {account.name}
        </h3>
        <span className="account-card-number amount">{account.maskedNumber}</span>
      </div>

      <div className="account-card-body">
        <div className="account-card-balance amount">
          {formatMoney(account.balance)}
        </div>
        {isCredit && (
          <div className="account-card-badge">
            <Badge variant="warning">Amount due</Badge>
          </div>
        )}
      </div>
    </article>
  )
}

