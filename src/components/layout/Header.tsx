import type { Segment } from '../../api/types'
import type { Theme } from '../../hooks/useTheme'
import { SegmentSwitch } from './SegmentSwitch'
import { ThemeToggle } from './ThemeToggle'

export interface HeaderProps {
  theme: Theme
  segment: Segment
  onToggleTheme: () => void
  onSegmentChange: (segment: Segment) => void
  customerInitials?: string
}

export function Header({
  theme,
  segment,
  onToggleTheme,
  onSegmentChange,
  customerInitials = 'AC',
}: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="header-container">
        {/* Brand Logo & Name */}
        <div className="header-brand">
          <div className="brand-logo" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19V5l8 9 8-9v14" />
            </svg>
          </div>
          <span className="brand-name">Meridian</span>
        </div>

        {/* Desktop Nav Links (Overview active, others disabled/decoration) */}
        <nav className="header-nav" aria-label="Main navigation">
          <button
            type="button"
            className="nav-link active"
            aria-current="page"
          >
            Overview
          </button>
          <button
            type="button"
            className="nav-link disabled"
            disabled
            aria-disabled="true"
            title="Out of scope"
          >
            Cards
          </button>
          <button
            type="button"
            className="nav-link disabled"
            disabled
            aria-disabled="true"
            title="Out of scope"
          >
            Payments
          </button>
          <button
            type="button"
            className="nav-link disabled"
            disabled
            aria-disabled="true"
            title="Out of scope"
          >
            Insights
          </button>
        </nav>

        {/* Right side controls */}
        <div className="header-actions">
          <SegmentSwitch
            segment={segment}
            onSegmentChange={onSegmentChange}
          />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <div
            className="user-avatar"
            aria-label={`User profile for ${customerInitials}`}
            role="img"
          >
            <span>{customerInitials}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

