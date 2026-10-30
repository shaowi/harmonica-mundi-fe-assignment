import type { CSSProperties } from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
  style?: CSSProperties
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  style,
}: SkeletonProps) {
  const dynamicStyle: CSSProperties = {
    ...style,
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...(borderRadius !== undefined ? { borderRadius } : {}),
  }

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={dynamicStyle}
      aria-hidden="true"
    />
  )
}

