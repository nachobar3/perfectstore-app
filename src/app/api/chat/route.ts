import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

async function getDataContext() {
  // Get market share
  const { data: marketShare } = await supabase
    .from('v_market_share_by_region')
    .select('*')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  // Aggregate market share by region
  const shareByRegion: Record<string, { own: number; total: number }> = {}
  marketShare?.forEach((row: any) => {
    if (!shareByRegion[row.region_name]) {
      shareByRegion[row.region_name] = { own: 0, total: 0 }
    }
    shareByRegion[row.region_name].total += Number(row.total_revenue)
    if (row.is_own_brand) {
      shareByRegion[row.region_name].own += Number(row.total_revenue)
    }
  })

  const marketShareSummary = Object.entries(shareByRegion).map(([region, data]) => ({
    region,
    share: ((data.own / data.total) * 100).toFixed(1) + '%',
    revenue: '$' + Math.round(data.own).toLocaleString()
  }))

  // Get perfect store scores
  const { data: scores } = await supabase.rpc('calculate_perfect_store_score')

  // Get alerts
  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent sell-out by channel
  const { data: sellOutByChannel } = await supabase
    .from('v_sell_out_detail')
    .select('channel_name, revenue, units, is_own_brand')
    .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const channelSummary: Record<string, { own: number; total: number; units: number }> = {}
  sellOutByChannel?.forEach((row: any) => {
    if (!channelSummary[row.channel_name]) {
      channelSummary[row.channel_name] = { own: 0, total: 0, units: 0 }
    }
    channelSummary[row.channel_name].total += Number(row.revenue)
    if (row.is_own_brand) {
      channelSummary[row.channel_name].own += Number(row.revenue)
      channelSummary[row.channel_name].units += Number(row.units)
    }
  })

  // Get top products
  const { data: topProducts } = await supabase
    .from('v_sell_out_detail')
    .select('product_name, revenue, units')
    .eq('is_own_brand', true)
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const productSales: Record<string, { revenue: number; units: number }> = {}
  topProducts?.forEach((row: any) => {
    if (!productSales[row.product_name]) {
      productSales[row.product_name] = { revenue: 0, units: 0 }
    }
    productSales[row.product_name].revenue += Number(row.revenue)
    productSales[row.product_name].units += Number(row.units)
  })

  const topProductsList = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([name, data]) => ({ name, ...data }))

  return {
    marketShareByRegion: marketShareSummary,
    perfectStoreScores: scores?.map((s: any) => ({
      region: s.region_name,
      overall: s.overall_score,
      availability: s.availability_score,
      price: s.price_score,
      distribution: s.distribution_score
    })),
    activeAlerts: alerts?.map((a: any) => ({
      type: a.type,
      severity: a.severity,
      title: a.title,
      description: a.description
    })),
    salesByChannel: Object.entries(channelSummary).map(([channel, data]) => ({
      channel,
      revenue: Math.round(data.own),
      share: ((data.own / data.total) * 100).toFixed(1) + '%'
    })),
    topProducts: topProductsList,
    brandName: 'NutriSnack',
    competitors: ['PepsiCo (Lays)', 'Arcor', 'Mondelez', 'Georgalos'],
    regions: ['AMBA', 'Córdoba', 'Mendoza', 'Rosario', 'Tucumán'],
    channels: ['Supermercado', 'Autoservicio', 'Kiosco', 'Almacén']
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const context = await getDataContext()

    const systemPrompt = `Eres un asistente de análisis comercial para la marca NutriSnack, una empresa de snacks saludables en Argentina.
Tu rol es ayudar a analistas y gerentes comerciales a entender sus datos de ventas y tomar decisiones.

DATOS ACTUALES DEL NEGOCIO:
${JSON.stringify(context, null, 2)}

INSTRUCCIONES:
- Responde siempre en español
- Sé conciso pero informativo
- Cuando menciones números, formatea los valores monetarios con $ y usa separadores de miles
- Si te preguntan por regiones, canales, o productos específicos, usa los datos del contexto
- Sugiere acciones concretas cuando sea apropiado
- Si no tienes datos específicos para responder algo, indícalo claramente
- Puedes hacer comparaciones con la competencia usando los datos de market share
- El Perfect Store Score tiene 3 componentes: disponibilidad, precio competitivo, y distribución

FORMATO:
- Usa bullet points para listas
- Destaca los números importantes
- Si hay alertas relevantes a la pregunta, menciónalas`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Error processing chat request' },
      { status: 500 }
    )
  }
}
