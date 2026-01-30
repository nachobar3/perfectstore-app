export interface Region {
  id: string
  name: string
}

export interface Brand {
  id: string
  name: string
  is_own_brand: boolean
}

export interface Product {
  id: string
  name: string
  brand_id: string
  category_id: string
  ean: string
  unit_size: string
}

export interface MarketShareData {
  region_name: string
  own_brand_share_pct: number
  total_market: number
}

export interface PerfectStoreScore {
  region_id: string
  region_name: string
  availability_score: number
  price_score: number
  distribution_score: number
  overall_score: number
}

export interface Alert {
  id: string
  type: 'stock_break' | 'price_alert' | 'share_loss' | 'opportunity'
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  is_read: boolean
  created_at: string
  product_id?: string
  region_id?: string
  point_of_sale_id?: string
}

export interface SellOutDetail {
  date: string
  units: number
  revenue: number
  price: number
  product_name: string
  brand_name: string
  is_own_brand: boolean
  channel_name: string
  region_name: string
}

export interface KPIData {
  totalRevenue: number
  revenueChange: number
  marketShare: number
  shareChange: number
  avgPrice: number
  priceVsCompetition: number
  availability: number
  availabilityChange: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
