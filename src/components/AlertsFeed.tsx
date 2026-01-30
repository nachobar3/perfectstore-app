'use client'

import { AlertTriangle, TrendingDown, Target, Package } from 'lucide-react'
import type { Alert } from '@/lib/types'

interface AlertsFeedProps {
  alerts: Alert[]
}

const alertIcons: Record<string, React.ReactNode> = {
  stock_break: <Package className="w-5 h-5" />,
  price_alert: <AlertTriangle className="w-5 h-5" />,
  share_loss: <TrendingDown className="w-5 h-5" />,
  opportunity: <Target className="w-5 h-5" />
}

const severityColors: Record<string, string> = {
  high: 'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  low: 'bg-blue-50 border-blue-200 text-blue-700'
}

const severityIconColors: Record<string, string> = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-blue-500'
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Alertas</h3>
        <p className="text-gray-500 text-sm">No hay alertas activas</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Alertas</h3>
        <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
          {alerts.filter(a => !a.is_read).length} nuevas
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${severityColors[alert.severity]} cursor-pointer hover:opacity-80 transition-opacity`}
          >
            <div className="flex items-start gap-3">
              <span className={severityIconColors[alert.severity]}>
                {alertIcons[alert.type]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                {alert.description && (
                  <p className="text-xs mt-1 opacity-80 line-clamp-2">
                    {alert.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
