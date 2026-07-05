import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, parseISO, startOfMonth, formatISO } from 'date-fns'
import type { ServiceLogWithParts } from '../services/api'
import { Card } from '../../components/Card'

interface CostAnalyticsProps {
  logs: ServiceLogWithParts[]
  currency: string
}

export function CostAnalytics({ logs, currency }: CostAnalyticsProps) {
  // Aggregate cost by month
  const spendOverTime = useMemo(() => {
    const months = new Map<string, number>()
    
    logs.forEach(log => {
      const monthStr = formatISO(startOfMonth(parseISO(log.service_date)))
      
      // Calculate total cost (labor + parts)
      let totalCost = log.cost
      log.vt_service_log_parts?.forEach(part => {
        totalCost += (part.quantity * part.unit_cost)
      })

      months.set(monthStr, (months.get(monthStr) || 0) + totalCost)
    })

    return Array.from(months.entries())
      .map(([dateStr, cost]) => ({
        date: dateStr,
        displayDate: format(parseISO(dateStr), 'MMM yyyy'),
        cost
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [logs])

  // Aggregate cost by category
  const spendByCategory = useMemo(() => {
    const cats = new Map<string, number>()

    logs.forEach(log => {
      const catName = log.category?.name || 'Uncategorized'
      let totalCost = log.cost
      log.vt_service_log_parts?.forEach(part => {
        totalCost += (part.quantity * part.unit_cost)
      })

      cats.set(catName, (cats.get(catName) || 0) + totalCost)
    })

    return Array.from(cats.entries())
      .map(([name, cost]) => ({ name, cost }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5) // Top 5 categories
  }, [logs])

  const formatCurrency = (val: number) => `${currency} ${val.toLocaleString()}`

  if (logs.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4">
          Spend Over Time
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spendOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={(val) => `${val >= 1000 ? (val/1000) + 'k' : val}`}
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-2)'
                }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
              />
              <Area 
                type="monotone" 
                dataKey="cost" 
                stroke="var(--color-accent)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCost)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-4">
          Top Expenses by Category
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spendByCategory} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'Cost']}
                cursor={{ fill: 'var(--color-border)', opacity: 0.2 }}
                contentStyle={{ 
                  backgroundColor: 'var(--color-surface)', 
                  borderColor: 'var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-2)'
                }}
              />
              <Bar 
                dataKey="cost" 
                fill="var(--color-accent)" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
