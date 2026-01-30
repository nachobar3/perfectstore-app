'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface MarketShareChartProps {
  data: Array<{
    region_name: string
    own_brand_share_pct: number
    total_market: number
  }>
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6']

export function MarketShareChart({ data }: MarketShareChartProps) {
  const chartData = data.map(d => ({
    region: d.region_name,
    'Market Share (%)': Number(d.own_brand_share_pct.toFixed(1))
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Market Share por Región</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" domain={[0, 30]} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="region" type="category" width={80} />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Market Share']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Bar dataKey="Market Share (%)" fill="#10b981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface SalesTrendChartProps {
  data: Array<{
    week: string
    nutrisnack: number
    competencia: number
  }>
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Evolución de Ventas (últimos 90 días)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              tickFormatter={(v) => {
                const d = new Date(v)
                return `${d.getDate()}/${d.getMonth() + 1}`
              }}
            />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
              labelFormatter={(label) => `Semana del ${new Date(String(label)).toLocaleDateString('es-AR')}`}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="nutrisnack"
              name="NutriSnack"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="competencia"
              name="Competencia"
              stroke="#9ca3af"
              strokeWidth={2}
              dot={{ fill: '#9ca3af', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

interface PerfectStoreGaugeProps {
  scores: Array<{
    region_name: string
    overall_score: number
    availability_score: number
    price_score: number
    distribution_score: number
  }>
}

export function PerfectStoreGauge({ scores }: PerfectStoreGaugeProps) {
  const avgScore = scores.length > 0
    ? scores.reduce((sum, s) => sum + Number(s.overall_score), 0) / scores.length
    : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Perfect Store Score</h3>

      {/* Main Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(avgScore / 100) * 352} 352`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{avgScore.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Breakdown by region */}
      <div className="space-y-3">
        {scores.map((score, i) => (
          <div key={score.region_name} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600">{score.region_name}</div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${score.overall_score}%`,
                  backgroundColor: COLORS[i % COLORS.length]
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-right">
              {Number(score.overall_score).toFixed(0)}
            </div>
          </div>
        ))}
      </div>

      {/* Score breakdown */}
      {scores.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Promedio nacional por componente:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {(scores.reduce((s, r) => s + Number(r.availability_score), 0) / scores.length).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Disponibilidad</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {(scores.reduce((s, r) => s + Number(r.price_score), 0) / scores.length).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Precio</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {(scores.reduce((s, r) => s + Number(r.distribution_score), 0) / scores.length).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Distribución</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ChannelMixChartProps {
  data: Array<{
    channel: string
    revenue: number
  }>
}

export function ChannelMixChart({ data }: ChannelMixChartProps) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0)
  const chartData = data.map((d, i) => ({
    name: d.channel,
    value: d.revenue,
    percentage: ((d.revenue / total) * 100).toFixed(1)
  }))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Mix de Canales</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-gray-600">{d.name}</span>
            <span className="font-medium">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
