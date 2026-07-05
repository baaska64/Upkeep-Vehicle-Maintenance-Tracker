import type { DueTier } from '../lib/reminders'

interface RingGaugeProps {
  percentageRemaining: number // 0 to 100
  tier: DueTier
  size?: number
  strokeWidth?: number
  icon?: React.ReactNode
}

export function RingGauge({ 
  percentageRemaining, 
  tier, 
  size = 64, 
  strokeWidth = 6,
  icon
}: RingGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  
  // Convert percentage remaining to an offset
  // At 100% remaining, offset is 0 (full ring)
  // At 0% remaining, offset is full circumference (empty ring)
  const safePercentage = Math.max(0, Math.min(100, percentageRemaining))
  const offset = circumference - (safePercentage / 100) * circumference

  const getTierColor = (t: DueTier) => {
    switch (t) {
      case 'good': return 'var(--tier-good)'
      case 'ok': return 'var(--tier-ok)'
      case 'warn': return 'var(--tier-warn)'
      default: return 'var(--color-border)'
    }
  }

  const strokeColor = getTierColor(tier)
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background track */}
      <svg className="absolute inset-0" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ transformOrigin: '50% 50%', transform: 'rotate(-90deg)' }}
        />
      </svg>
      
      {/* Icon inside */}
      {icon && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ color: strokeColor }}
        >
          {icon}
        </div>
      )}
    </div>
  )
}
