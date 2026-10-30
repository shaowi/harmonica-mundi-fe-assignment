import type { ReactNode } from 'react'

export interface BadgeProps {
  variant?: 'neutral' | 'warning' | 'pending' | 'positive'
  className?: string
  children: ReactNode
}

export function Badge({
  variant = 'neutral',
  className = '',
  children,
}: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  )
}

