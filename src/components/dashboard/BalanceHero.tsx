import { formatMoney } from '../../lib/format'
import { Button } from '../ui/Button'

export interface BalanceHeroProps {
  totalAvailable: number
  depositCount: number
  onNewTransfer?: () => void
}

export function BalanceHero({
  totalAvailable,
  depositCount,
  onNewTransfer,
}: BalanceHeroProps) {
  return (
    <section className="balance-hero" aria-labelledby="total-available-heading">
      <div className="balance-hero-content">
        <div className="balance-hero-info">
          <span id="total-available-heading" className="balance-hero-label">
            Total available
          </span>
          <div className="balance-hero-amount amount">
            {formatMoney(totalAvailable)}
          </div>
          <span className="balance-hero-caption">
            Across {depositCount} deposit accounts
          </span>
        </div>

        <div className="balance-hero-cta">
          <Button
            variant="secondary"
            className="hero-transfer-btn"
            onClick={onNewTransfer}
          >
            <svg
              width="16"
              height="16"
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
    </section>
  )
}

