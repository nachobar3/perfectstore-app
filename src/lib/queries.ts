import { supabase } from './supabase'
import type { MarketShareData, PerfectStoreScore, Alert, KPIData } from './types'

export async function getMarketShare(): Promise<MarketShareData[]> {
  const { data, error } = await supabase.rpc('get_market_share_by_region')

  if (error) {
    // Fallback to direct query
    const { data: fallbackData } = await supabase
      .from('v_market_share_by_region')
      .select('*')

    if (!fallbackData) return []

    // Aggregate the data
    const aggregated = fallbackData.reduce((acc: Record<string, any>, row: any) => {
      if (!acc[row.region_name]) {
        acc[row.region_name] = { region_name: row.region_name, own_revenue: 0, total_revenue: 0 }
      }
      acc[row.region_name].total_revenue += Number(row.total_revenue)
      if (row.is_own_brand) {
        acc[row.region_name].own_revenue += Number(row.total_revenue)
      }
      return acc
    }, {})

    return Object.values(aggregated).map((r: any) => ({
      region_name: r.region_name,
      own_brand_share_pct: r.total_revenue > 0 ? (r.own_revenue / r.total_revenue) * 100 : 0,
      total_market: r.total_revenue
    }))
  }

  return data || []
}

export async function getPerfectStoreScores(): Promise<PerfectStoreScore[]> {
  const { data, error } = await supabase.rpc('calculate_perfect_store_score')

  if (error) {
    console.error('Error fetching perfect store scores:', error)
    return []
  }

  return data || []
}

export async function getAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }

  return data || []
}

export async function getKPIs(): Promise<KPIData> {
  // Get current period revenue (last 30 days)
  const { data: currentRevenue } = await supabase
    .from('v_sell_out_detail')
    .select('revenue, is_own_brand')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  // Get previous period revenue (30-60 days ago)
  const { data: previousRevenue } = await supabase
    .from('v_sell_out_detail')
    .select('revenue, is_own_brand')
    .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .lt('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const currentOwn = currentRevenue?.filter(r => r.is_own_brand).reduce((sum, r) => sum + Number(r.revenue), 0) || 0
  const currentTotal = currentRevenue?.reduce((sum, r) => sum + Number(r.revenue), 0) || 1
  const previousOwn = previousRevenue?.filter(r => r.is_own_brand).reduce((sum, r) => sum + Number(r.revenue), 0) || 0
  const previousTotal = previousRevenue?.reduce((sum, r) => sum + Number(r.revenue), 0) || 1

  const currentShare = (currentOwn / currentTotal) * 100
  const previousShare = (previousOwn / previousTotal) * 100

  // Get price comparison
  const { data: prices } = await supabase
    .from('v_sell_out_detail')
    .select('price, is_own_brand')
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const ownPrices = prices?.filter(p => p.is_own_brand).map(p => Number(p.price)) || []
  const compPrices = prices?.filter(p => !p.is_own_brand).map(p => Number(p.price)) || []
  const avgOwnPrice = ownPrices.length > 0 ? ownPrices.reduce((a, b) => a + b, 0) / ownPrices.length : 0
  const avgCompPrice = compPrices.length > 0 ? compPrices.reduce((a, b) => a + b, 0) / compPrices.length : 1

  return {
    totalRevenue: currentOwn,
    revenueChange: previousOwn > 0 ? ((currentOwn - previousOwn) / previousOwn) * 100 : 0,
    marketShare: currentShare,
    shareChange: currentShare - previousShare,
    avgPrice: avgOwnPrice,
    priceVsCompetition: ((avgOwnPrice - avgCompPrice) / avgCompPrice) * 100,
    availability: 78, // Placeholder - would calculate from actual data
    availabilityChange: 2.3
  }
}

export async function getSellOutTrend() {
  const { data, error } = await supabase
    .from('v_sell_out_detail')
    .select('date, revenue, is_own_brand')
    .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date')

  if (error || !data) return []

  // Aggregate by week
  const weeklyData: Record<string, { own: number; competition: number }> = {}

  data.forEach(row => {
    const weekStart = getWeekStart(new Date(row.date))
    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = { own: 0, competition: 0 }
    }
    if (row.is_own_brand) {
      weeklyData[weekStart].own += Number(row.revenue)
    } else {
      weeklyData[weekStart].competition += Number(row.revenue)
    }
  })

  return Object.entries(weeklyData)
    .map(([week, data]) => ({
      week,
      nutrisnack: Math.round(data.own),
      competencia: Math.round(data.competition)
    }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return d.toISOString().split('T')[0]
}

export async function getRegions() {
  const { data } = await supabase.from('regions').select('*')
  return data || []
}

export async function getChannels() {
  const { data } = await supabase.from('channels').select('*')
  return data || []
}

// Function to get context for AI chat
export async function getDataContext() {
  const [marketShare, scores, alerts, kpis, regions, channels] = await Promise.all([
    getMarketShare(),
    getPerfectStoreScores(),
    getAlerts(),
    getKPIs(),
    getRegions(),
    getChannels()
  ])

  return {
    marketShare,
    perfectStoreScores: scores,
    alerts,
    kpis,
    regions: regions.map(r => r.name),
    channels: channels.map(c => c.name),
    brandName: 'NutriSnack'
  }
}
