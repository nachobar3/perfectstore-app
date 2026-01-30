# PerfectStore

Plataforma de analytics para marcas de consumo masivo. Dashboard interactivo con KPIs, chat con IA para consultas en lenguaje natural, y tracking de Perfect Store Score.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)
![Claude AI](https://img.shields.io/badge/Claude-AI%20Chat-orange)

## Features

- **Dashboard de KPIs**: Revenue, Market Share, Precio vs Competencia, Cobertura de PDVs
- **Gráficos Interactivos**: Evolución de ventas, Market Share por región, Mix de canales
- **Perfect Store Score**: Gauge con breakdown por región (Disponibilidad, Precio, Distribución)
- **Alertas Inteligentes**: Quiebres de stock, alertas de precio, pérdida de share, oportunidades
- **Chat con IA**: Consultas en lenguaje natural sobre tus datos comerciales

## Demo

```
┌─────────────────────────────────────────────────────────────┐
│  Revenue (30d)  │  Market Share  │  Precio vs Comp  │  PDVs │
│     $658k       │     22.1%      │      +3.2%       │  78%  │
├─────────────────────────────────────────────────────────────┤
│  [Gráfico de evolución de ventas - 90 días]                 │
├─────────────────────────────────────────────────────────────┤
│  [Market Share x Región]  │  [Perfect Store Score: 92]      │
│  [Mix de Canales]         │  [Alertas activas]              │
├─────────────────────────────────────────────────────────────┤
│  💬 Chat: "¿Cómo está mi disponibilidad en Córdoba?"        │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Icons**: Lucide React

## Requisitos

- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)
- API Key de [Anthropic](https://console.anthropic.com)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/nachobar3/perfectstore-app.git
cd perfectstore-app
npm install
```

### 2. Configurar Supabase

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar las migraciones SQL (ver sección [Schema de Base de Datos](#schema-de-base-de-datos))
3. Copiar la URL y Anon Key del proyecto

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Anthropic (para chat con IA)
ANTHROPIC_API_KEY=sk-ant-api03-xxx
```

### 4. Ejecutar

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Schema de Base de Datos

### Tablas principales

```sql
-- Regiones
CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Canales (Supermercado, Autoservicio, Kiosco, Almacén)
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

-- Marcas (propias y competidoras)
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_own_brand BOOLEAN NOT NULL DEFAULT false
);

-- Productos (SKUs)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand_id UUID REFERENCES brands(id),
    category_id UUID REFERENCES categories(id),
    ean TEXT,
    unit_size TEXT
);

-- Puntos de Venta
CREATE TABLE points_of_sale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel_id UUID REFERENCES channels(id),
    region_id UUID REFERENCES regions(id)
);

-- Sell-In (facturación de distribuidores - solo marca propia)
CREATE TABLE sell_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    distributor_id UUID REFERENCES distributors(id),
    date DATE NOT NULL,
    units INTEGER NOT NULL,
    revenue DECIMAL(12, 2) NOT NULL
);

-- Sell-Out (ventas en PDV - incluye competencia)
CREATE TABLE sell_out (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    point_of_sale_id UUID REFERENCES points_of_sale(id),
    date DATE NOT NULL,
    units INTEGER NOT NULL,
    revenue DECIMAL(12, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Alertas
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'stock_break', 'price_alert', 'share_loss', 'opportunity'
    severity TEXT NOT NULL, -- 'low', 'medium', 'high'
    title TEXT NOT NULL,
    description TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Función de Perfect Store Score

```sql
CREATE OR REPLACE FUNCTION calculate_perfect_store_score(
    p_region_id UUID DEFAULT NULL
)
RETURNS TABLE (
    region_id UUID,
    region_name TEXT,
    availability_score NUMERIC,
    price_score NUMERIC,
    distribution_score NUMERIC,
    overall_score NUMERIC
);
```

## Preguntas para el Chat

El asistente de IA puede responder consultas como:

- "¿Cómo está mi market share esta semana?"
- "¿Cuáles son mis productos top?"
- "¿Dónde tengo oportunidades de crecimiento?"
- "¿Cómo está mi precio vs la competencia en Córdoba?"
- "Dame el Perfect Store Score por región"
- "¿Qué productos tienen quiebre de stock?"
- "Comparame sell-in vs sell-out del último mes"

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/chat/route.ts    # API endpoint para chat con Claude
│   ├── page.tsx             # Página principal
│   └── layout.tsx           # Layout con metadata
├── components/
│   ├── Dashboard.tsx        # Layout del dashboard
│   ├── KPICard.tsx          # Tarjetas de métricas
│   ├── Charts.tsx           # Gráficos (Recharts)
│   ├── AlertsFeed.tsx       # Feed de alertas
│   └── Chat.tsx             # Componente de chat
└── lib/
    ├── supabase.ts          # Cliente de Supabase
    ├── queries.ts           # Funciones de consulta
    └── types.ts             # Tipos TypeScript
```

## Roadmap

- [ ] Filtros por fecha y región
- [ ] Export de reportes a PDF/Excel
- [ ] Comparativas periodo a periodo
- [ ] Integración con datos reales (conectores)
- [ ] Alertas en tiempo real (webhooks)
- [ ] Mobile app

## Licencia

MIT

---

Desarrollado con [Claude Code](https://claude.ai/code)
