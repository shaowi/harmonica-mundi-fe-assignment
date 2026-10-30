import type { Segment } from '../../api/types'

export interface SegmentSwitchProps {
  segment: Segment
  onSegmentChange: (segment: Segment) => void
}

export function SegmentSwitch({
  segment,
  onSegmentChange,
}: SegmentSwitchProps) {
  return (
    <div
      className="segment-switch"
      role="group"
      aria-label="Customer segment selection"
    >
      <button
        type="button"
        className={`segment-btn ${segment === 'retail' ? 'active' : ''}`}
        aria-pressed={segment === 'retail'}
        onClick={() => onSegmentChange('retail')}
      >
        Retail
      </button>
      <button
        type="button"
        className={`segment-btn ${segment === 'premium' ? 'active' : ''}`}
        aria-pressed={segment === 'premium'}
        onClick={() => onSegmentChange('premium')}
      >
        Premium
      </button>
    </div>
  )
}

