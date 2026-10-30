import { Button } from '../ui/Button'

export interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <div className="dashboard-error-container" role="alert">
      <div className="dashboard-error-card">
        <div className="dashboard-error-icon" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="dashboard-error-message">
          We couldn't load your dashboard.
        </h2>
        <p className="dashboard-error-description">
          Please check your connection and try again.
        </p>
        <Button variant="primary" onClick={onRetry} className="dashboard-retry-btn">
          Retry
        </Button>
      </div>
    </div>
  )
}

