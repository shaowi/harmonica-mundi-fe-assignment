import { useMemo, useState } from 'react'
import type { Transaction } from '../../api/types'
import { EmptyState } from '../ui/EmptyState'
import { SearchInput } from '../ui/SearchInput'
import { TransactionItem } from './TransactionItem'

export interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter transactions by description or category, ignoring case (D6)
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return transactions

    return transactions.filter(
      (txn) =>
        txn.description.toLowerCase().includes(query) ||
        txn.category.toLowerCase().includes(query),
    )
  }, [transactions, searchQuery])

  const handleClear = () => {
    setSearchQuery('')
  }

  const isFiltering = searchQuery.trim().length > 0
  const matchCount = filteredTransactions.length

  return (
    <section
      className="transactions-section"
      aria-labelledby="transactions-heading"
    >
      <div className="transactions-header">
        <div className="transactions-title-wrap">
          <h2 id="transactions-heading" className="section-title">
            Recent transactions
          </h2>
          {isFiltering && (
            <span
              className="search-results-count"
              aria-live="polite"
              role="status"
            >
              {matchCount === 1
                ? '1 match found'
                : `${matchCount} matches found`}
            </span>
          )}
        </div>

        <div className="transactions-search-wrap">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={handleClear}
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          message="No transactions match your search."
          actionLabel="Clear search"
          onAction={handleClear}
        />
      ) : (
        <ul
          className="transactions-list"
          aria-label="Recent transactions list"
        >
          {filteredTransactions.map((txn) => (
            <TransactionItem key={txn.id} transaction={txn} />
          ))}
        </ul>
      )}
    </section>
  )
}

