import type { CSSProperties } from 'react';

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  className?: string;
}

export function SkeletonLoader({
  width = '100%',
  height = '20px',
  rounded = false,
  className = '',
}: SkeletonLoaderProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: rounded ? '50%' : 'var(--radius-sm)',
    backgroundColor: 'var(--color-border)',
    animation: 'skeleton-pulse 1.8s ease-in-out infinite',
  };

  return <div className={className} style={style} aria-hidden="true" />;
}
