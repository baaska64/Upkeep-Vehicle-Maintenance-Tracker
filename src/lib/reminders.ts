import { differenceInMonths } from 'date-fns'
import type { ServiceLogWithParts } from '../features/services/api'
import type { Vehicle, ServiceCategory, UserServiceInterval } from '../types/database'

export type DueTier = 'good' | 'ok' | 'warn' | 'unknown'

export interface ReminderStatus {
  category: ServiceCategory
  tier: DueTier
  percentageRemaining: number // 0 to 100
  dueText: string
  isOverdue: boolean
  intervalMonths: number | null
  intervalKm: number | null
}

/**
 * Resolves the effective interval for a category, checking user overrides first.
 */
function resolveInterval(
  category: ServiceCategory,
  userIntervals?: UserServiceInterval[]
): { months: number | null; km: number | null } {
  // Check for user override first
  const override = userIntervals?.find(ui => ui.category_id === category.id)
  if (override) {
    return {
      months: override.custom_interval_months,
      km: override.custom_interval_km,
    }
  }

  // Fall back to category defaults from DB
  return {
    months: category.default_interval_months,
    km: category.default_interval_km,
  }
}

export function calculateReminder(
  category: ServiceCategory,
  vehicle: Vehicle,
  latestLog?: ServiceLogWithParts,
  userIntervals?: UserServiceInterval[]
): ReminderStatus | null {
  const interval = resolveInterval(category, userIntervals)

  // -1 signifies the user explicitly ignored this category
  if (interval.months === -1 && interval.km === -1) {
    return null
  }

  // If no intervals defined, we can't calculate due status
  if (!interval.km && !interval.months) {
    return {
      category,
      tier: 'unknown',
      percentageRemaining: 100,
      dueText: 'No interval set',
      isOverdue: false,
      intervalMonths: null,
      intervalKm: null,
    }
  }

  // If we have an interval but no logs, we calculate based on vehicle acquisition date and 0 mileage
  const effectiveLog = latestLog || {
    service_date: vehicle.acquired_date || vehicle.created_at,
    mileage_at_service: 0,
  }

  let distancePercent = 100
  let timePercent = 100
  let distanceDueText = ''
  let timeDueText = ''
  let isDistanceOverdue = false
  let isTimeOverdue = false

  // 1. Calculate distance-based remaining
  if (interval.km) {
    const distanceSince = vehicle.current_mileage - effectiveLog.mileage_at_service
    const remainingDistance = interval.km - distanceSince

    distancePercent = Math.max(0, Math.min(100, (remainingDistance / interval.km) * 100))
    isDistanceOverdue = remainingDistance <= 0

    if (isDistanceOverdue) {
      distanceDueText = `Overdue by ${Math.abs(remainingDistance).toLocaleString()} ${vehicle.mileage_unit}`
    } else {
      distanceDueText = `Due in ${remainingDistance.toLocaleString()} ${vehicle.mileage_unit}`
    }
  }

  // 2. Calculate time-based remaining
  if (interval.months) {
    const monthsSince = differenceInMonths(new Date(), new Date(effectiveLog.service_date))
    const remainingMonths = interval.months - monthsSince

    timePercent = Math.max(0, Math.min(100, (remainingMonths / interval.months) * 100))
    isTimeOverdue = remainingMonths <= 0

    if (isTimeOverdue) {
      timeDueText = `Overdue by ${Math.abs(remainingMonths)} mo`
    } else {
      timeDueText = `Due in ${remainingMonths} mo`
    }
  }

  // We use whichever is closer to 0% (the limiting factor)
  const isTimeLimiting = timePercent < distancePercent
  const percentageRemaining = Math.min(distancePercent, timePercent)

  // Decide the tier
  let tier: DueTier = 'good'
  if (percentageRemaining <= 0) {
    tier = 'warn' // Overdue
  } else if (percentageRemaining <= 20) {
    tier = 'ok' // Due soon (<20% remaining)
  }

  const isOverdue = isDistanceOverdue || isTimeOverdue

  // Choose the text that represents the limiting factor
  let dueText = ''
  if (interval.km && interval.months) {
    dueText = isTimeLimiting ? timeDueText : distanceDueText
  } else if (interval.km) {
    dueText = distanceDueText
  } else {
    dueText = timeDueText
  }

  return {
    category,
    tier,
    percentageRemaining,
    dueText,
    isOverdue,
    intervalMonths: interval.months,
    intervalKm: interval.km,
  }
}

export function getAllReminders(
  categories: ServiceCategory[],
  vehicle: Vehicle,
  logs: ServiceLogWithParts[],
  userIntervals?: UserServiceInterval[]
): ReminderStatus[] {
  const reminders = categories.map(cat => {
    // Find the most recent log for this category
    const categoryLogs = logs.filter(l => l.category_id === cat.id)
    const latestLog = categoryLogs.length > 0
      ? categoryLogs.reduce((prev, current) =>
          (new Date(prev.service_date) > new Date(current.service_date)) ? prev : current
        )
      : undefined

    return calculateReminder(cat, vehicle, latestLog, userIntervals)
  }).filter((r): r is ReminderStatus => r !== null)

  return reminders.sort((a, b) => {
    // Sort overdue first, then by percentage remaining ascending
    if (a.isOverdue && !b.isOverdue) return -1
    if (!a.isOverdue && b.isOverdue) return 1
    return a.percentageRemaining - b.percentageRemaining
  })
}
