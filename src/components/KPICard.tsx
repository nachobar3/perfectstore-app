'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
}

export function KPICard({ title, value, change, changeLabel, icon }: KPICardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  const getTrendColor = () => {
    if (change === undefined) return 'text-gray-500'
    if (change > 0) return 'text-green-500'
    if (change < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
          </div>
        )}
      </div>
      {changeLabel && (
        <span className="text-xs text-gray-400 mt-1">{changeLabel}</span>
      )}
    </div>
  )
}
