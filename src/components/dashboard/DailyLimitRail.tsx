import type { Customer } from '../../api/types'
import { formatMoney } from '../../lib/format'

export interface DailyLimitRailProps {
  customer?: Customer
}

export function DailyLimitRail({ customer }: DailyLimitRailProps) {
  const limit = customer?.dailyTransferLimit ?? 5000
  const used = customer?.transferredToday ?? 0
  const remaining = Math.max(0, limit - used)

  const usedPercentage = Math.min(100, Math.max(0, (used / limit) * 100))

  return (
    <aside className="daily-limit-rail" aria-labelledby="daily-limit-title">
      <div className="daily-limit-card">
        <h2 id="daily-limit-title" className="daily-limit-title">
          Daily limit
        </h2>

        <div className="daily-limit-stat amount">
          <span className="daily-limit-remaining">
            {formatMoney(remaining)}
          </span>{' '}
          <span className="daily-limit-unit">remaining today</span>
        </div>

        <div
          className="progress-bar-track"
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-label="Daily transfer limit usage"
          title={`${formatMoney(used)} of ${formatMoney(limit)} used`}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <div className="daily-limit-meta">
          <span>{formatMoney(used)} used</span>
          <span>{formatMoney(limit)} limit</span>
        </div>

        <p className="daily-limit-caption">
          Resets daily. Applies to all transfers.
        </p>
      </div>
    </aside>
  )
}

