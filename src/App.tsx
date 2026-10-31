import { useState } from 'react'
import { useDashboardData } from './api/dashboard'
import { Dashboard } from './components/dashboard/Dashboard'
import { DashboardError } from './components/dashboard/DashboardError'
import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton'
import { Header } from './components/layout/Header'
import { TransferDialog } from './components/transfer/TransferDialog'
import { useTheme } from './hooks/useTheme'

import './components/ui/ui.css'
import './components/layout/Header.css'
import './components/dashboard/Dashboard.css'

export default function App() {
  const {
    customer,
    accounts,
    depositAccounts,
    totalAvailable,
    remainingDailyLimit,
    transactions,
    isPending,
    isError,
    refetch,
  } = useDashboardData()

  const { theme, segment, toggleTheme, setSegment } = useTheme(customer?.segment)

  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferOpener, setTransferOpener] = useState<HTMLElement | null>(null)

  const handleNewTransfer = (e?: React.MouseEvent<HTMLElement>) => {
    if (e?.currentTarget) {
      setTransferOpener(e.currentTarget)
    }
    setIsTransferOpen(true)
  }

  const customerInitials = customer
    ? `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase()
    : 'AC'

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        segment={segment}
        onToggleTheme={toggleTheme}
        onSegmentChange={setSegment}
        customerInitials={customerInitials}
      />

      <main id="main-content">
        {isError ? (
          <DashboardError onRetry={refetch} />
        ) : isPending ? (
          <DashboardSkeleton />
        ) : (
          <Dashboard
            customer={customer}
            accounts={accounts}
            depositAccounts={depositAccounts}
            totalAvailable={totalAvailable}
            transactions={transactions}
            onNewTransfer={handleNewTransfer}
          />
        )}
      </main>

      <TransferDialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        depositAccounts={depositAccounts}
        remainingDailyLimit={remainingDailyLimit}
        openerElement={transferOpener}
      />
    </div>
  )
}
