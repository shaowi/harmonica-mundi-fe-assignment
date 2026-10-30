import type { Account } from '../../api/types'
import { AccountCard } from './AccountCard'

export interface AccountListProps {
  accounts: Account[]
}

export function AccountList({ accounts }: AccountListProps) {
  return (
    <section className="accounts-section" aria-labelledby="accounts-heading">
      <div className="section-header">
        <h2 id="accounts-heading" className="section-title">
          Accounts
        </h2>
      </div>
      <div className="accounts-grid">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  )
}

