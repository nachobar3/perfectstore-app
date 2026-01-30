'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Tag, MapPin, RefreshCw } from 'lucide-react'
import { KPICard } from './KPICard'
import { AlertsFeed } from './AlertsFeed'
import { Chat } from './Chat'
import { MarketShareChart, SalesTrendChart, PerfectStoreGauge, ChannelMixChart } from './Charts'
import { getMarketShare, getPerfectStoreScores, getAlerts, getKPIs, getSellOutTrend } from '@/lib/queries'
import type { MarketShareData, PerfectStoreScore, Alert, KPIData } from '@/lib/types'

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [marketShare, setMarketShare] = useState<MarketShareData[]>([])
  const [perfectStoreScores, setPerfectStoreScores] = useState<PerfectStoreScore[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [kpis, setKPIs] = useState<KPIData | null>(null)
  const [salesTrend, setSalesTrend] = useState<any[]>([])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [ms, scores, alertsData, kpisData, trend] = await Promise.all([
        getMarketShare(),
        getPerfectStoreScores(),
        getAlerts(),
        getKPIs(),
        getSellOutTrend()
      ])
      setMarketShare(ms)
      setPerfectStoreScores(scores)
      setAlerts(alertsData)
      setKPIs(kpisData)
      setSalesTrend(trend)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate channel mix from market share data
  const channelMix = [
    { channel: 'Supermercado', revenue: 450000 },
    { channel: 'Autoservicio', revenue: 180000 },
    { channel: 'Kiosco', revenue: 45000 },
    { channel: 'Almacén', revenue: 35000 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">PS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PerfectStore</h1>
                <p className="text-xs text-gray-500">NutriSnack Analytics</p>
              </div>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Revenue (30d)"
            value={kpis ? `$${(kpis.totalRevenue / 1000).toFixed(0)}k` : '-'}
            change={kpis?.revenueChange}
            changeLabel="vs período anterior"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <KPICard
            title="Market Share"
            value={kpis ? `${kpis.marketShare.toFixed(1)}%` : '-'}
            change={kpis?.shareChange}
            changeLabel="vs período anterior"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <KPICard
            title="Precio vs Competencia"
            value={kpis ? `${kpis.priceVsCompetition > 0 ? '+' : ''}${kpis.priceVsCompetition.toFixed(1)}%` : '-'}
            icon={<Tag className="w-5 h-5" />}
          />
          <KPICard
            title="Cobertura PDVs"
            value={kpis ? `${kpis.availability}%` : '-'}
            change={kpis?.availabilityChange}
            changeLabel="vs semana anterior"
            icon={<MapPin className="w-5 h-5" />}
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <SalesTrendChart data={salesTrend} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketShareChart data={marketShare} />
              <ChannelMixChart data={channelMix} />
            </div>
          </div>

          {/* Right Column - Perfect Store Score, Alerts, Chat */}
          <div className="space-y-6">
            <PerfectStoreGauge scores={perfectStoreScores} />
            <AlertsFeed alerts={alerts} />
          </div>
        </div>

        {/* Chat Section - Full Width */}
        <div className="mt-8">
          <Chat />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            PerfectStore Demo - Datos simulados para demostración
          </p>
        </div>
      </footer>
    </div>
  )
}
