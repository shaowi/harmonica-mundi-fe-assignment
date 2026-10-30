import type { Account, Customer, Transaction } from '../../api/types'
import { Button } from '../ui/Button'
import { AccountList } from './AccountList'
import { BalanceHero } from './BalanceHero'
import { DailyLimitRail } from './DailyLimitRail'
import { TransactionList } from './TransactionList'

export interface DashboardProps {
  customer?: Customer
  accounts: Account[]
  depositAccounts: Account[]
  totalAvailable: number
  transactions: Transaction[]
  onNewTransfer?: () => void
}

export function Dashboard({
  customer,
  accounts,
  depositAccounts,
  totalAvailable,
  transactions,
  onNewTransfer,
}: DashboardProps) {
  const greetingName = customer?.firstName || 'Ava'

  return (
    <div className="dashboard-layout">
      {/* Top greeting section */}
      <section className="dashboard-greeting-section" aria-label="Welcome">
        <h1 className="dashboard-greeting-title">
          Good evening, {greetingName}
        </h1>
        <p className="dashboard-greeting-date">Tuesday, 20 October</p>
      </section>

      {/* Main 2-column grid */}
      <div className="dashboard-content">
        <div className="dashboard-main-col">
          {/* Balance Hero Card */}
          <BalanceHero
            totalAvailable={totalAvailable}
            depositCount={depositAccounts.length}
            onNewTransfer={onNewTransfer}
          />

          {/* Accounts Section */}
          <AccountList accounts={accounts} />

          {/* Recent Transactions Section */}
          <TransactionList transactions={transactions} />
        </div>

        {/* Right rail: Daily Limit */}
        <div className="dashboard-rail-col">
          <DailyLimitRail customer={customer} />
        </div>
      </div>

      {/* Mobile Sticky CTA Button (D8) */}
      <div className="mobile-sticky-cta" aria-hidden="false">
        <Button
          variant="primary"
          className="mobile-transfer-btn"
          onClick={onNewTransfer}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New transfer
        </Button>
      </div>
    </div>
  )
}

