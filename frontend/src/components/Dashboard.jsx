import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import apiService from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import './Dashboard.css'

// ── Clock ────────────────────────────────────────────────────────────────────
function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

function ClockWidget({ now }) {
  const hours   = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <div className="clock-widget">
      <div className="clock-time">
        <span className="clock-hm">{hours}:{minutes}</span>
        <span className="clock-seconds">{seconds}</span>
      </div>
      <div className="clock-date">{dateStr}</div>
    </div>
  )
}

function getGreeting(hour) {
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ── Custom tooltip shared style ───────────────────────────────────────────────
function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="ct-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="ct-row">
          <span className="ct-dot" style={{ background: p.color }} />
          <span className="ct-name">{p.name}</span>
          <span className="ct-value">{p.value?.toLocaleString()}{unit}</span>
        </div>
      ))}
    </div>
  )
}

// ── Live-ticker simulation ────────────────────────────────────────────────────
function useLiveData(baseData, field = 'count', jitter = 0.04) {
  const [data, setData] = useState(baseData)
  useEffect(() => {
    if (!baseData?.length) return
    setData(baseData)
    const id = setInterval(() => {
      setData(prev =>
        prev.map((row, i) => ({
          ...row,
          [field]: Math.max(1,
            Math.round(baseData[i][field] * (1 + (Math.random() - 0.5) * jitter))
          ),
        }))
      )
    }, 2200)
    return () => clearInterval(id)
  }, [baseData])
  return data
}

// ── Division area chart (stock-market style) ──────────────────────────────────
function DivisionChart({ rawData }) {
  const data = useLiveData(rawData)
  const max = Math.max(...(data?.map(d => d.count) ?? [1]))

  return (
    <div className="chart-card chart-card--full">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <span>Hospitals by Division</span>
          <span className="live-badge"><span className="live-dot" />LIVE</span>
        </div>
        <div className="chart-card-meta">{data?.length} divisions · hover to inspect</div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="divGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0f52a0" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#0f52a0" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="_id"
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, Math.ceil(max * 1.15)]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1.5, strokeDasharray: '4 2' }} />
          <Area
            type="monotone"
            dataKey="count"
            name="Hospitals"
            stroke="#0f52a0"
            strokeWidth={2.5}
            fill="url(#divGrad)"
            dot={{ r: 4, fill: '#0f52a0', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#0f52a0', stroke: '#fff', strokeWidth: 2.5 }}
            isAnimationActive
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Type bar chart ────────────────────────────────────────────────────────────
const TYPE_COLORS = ['#0f52a0', '#16a34a', '#d97706', '#7c3aed', '#dc2626', '#0284c7', '#db2777']

function TypeChart({ rawData }) {
  const data = useLiveData(rawData, 'count', 0.03)
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <span>By Hospital Type</span>
          <span className="live-badge"><span className="live-dot live-dot--green" />LIVE</span>
        </div>
        <div className="chart-card-meta">hover a bar</div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="_id"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(15,82,160,0.06)' }} />
          <Bar
            dataKey="count"
            name="Hospitals"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          >
            {data?.map((_, i) => (
              <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Public vs Private area chart ──────────────────────────────────────────────
function buildPublicPrivateSeries(pub, priv) {
  const labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return labels.map((month, i) => {
    const ratio = (i + 1) / 12
    return {
      month,
      Public:  Math.round(pub  * (0.6 + ratio * 0.4) + (Math.random() - 0.5) * pub  * 0.06),
      Private: Math.round(priv * (0.6 + ratio * 0.4) + (Math.random() - 0.5) * priv * 0.06),
    }
  })
}

function PublicPrivateChart({ publicCount, privateCount }) {
  const [series, setSeries] = useState(() => buildPublicPrivateSeries(publicCount, privateCount))

  useEffect(() => {
    const id = setInterval(() => {
      setSeries(prev => prev.map(pt => ({
        ...pt,
        Public:  Math.max(1, Math.round(pt.Public  * (1 + (Math.random() - 0.5) * 0.04))),
        Private: Math.max(1, Math.round(pt.Private * (1 + (Math.random() - 0.5) * 0.04))),
      })))
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-card-title">
          <span>Public vs Private</span>
          <span className="live-badge"><span className="live-dot live-dot--amber" />LIVE</span>
        </div>
        <div className="chart-card-meta">simulated trend · hover to compare</div>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="privGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#888', strokeWidth: 1, strokeDasharray: '4 2' }} />
          <Area type="monotone" dataKey="Public"  stroke="#16a34a" strokeWidth={2} fill="url(#pubGrad)"  dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={1400} />
          <Area type="monotone" dataKey="Private" stroke="#dc2626" strokeWidth={2} fill="url(#privGrad)" dot={false} activeDot={{ r: 5 }} isAnimationActive animationDuration={1400} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Summary ticker strip ──────────────────────────────────────────────────────
function TickerStrip({ stats }) {
  const [vals, setVals] = useState({ total: stats.totalHospitals, pub: stats.publicHospitals, priv: stats.privateHospitals })
  const [flash, setFlash] = useState({})

  useEffect(() => {
    const id = setInterval(() => {
      setVals(prev => {
        const next = {
          total: Math.round(prev.total * (1 + (Math.random() - 0.5) * 0.005)),
          pub:   Math.round(prev.pub   * (1 + (Math.random() - 0.5) * 0.005)),
          priv:  Math.round(prev.priv  * (1 + (Math.random() - 0.5) * 0.005)),
        }
        const f = {}
        if (next.total !== prev.total) f.total = next.total > prev.total ? 'up' : 'dn'
        if (next.pub   !== prev.pub)   f.pub   = next.pub   > prev.pub   ? 'up' : 'dn'
        if (next.priv  !== prev.priv)  f.priv  = next.priv  > prev.priv  ? 'up' : 'dn'
        setFlash(f)
        setTimeout(() => setFlash({}), 600)
        return next
      })
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const items = [
    { label: 'Total',   value: vals.total, key: 'total', color: '#0f52a0' },
    { label: 'Public',  value: vals.pub,   key: 'pub',   color: '#16a34a' },
    { label: 'Private', value: vals.priv,  key: 'priv',  color: '#dc2626' },
    { label: 'Divisions', value: stats.byDivision?.length ?? 0, key: null, color: '#7c3aed' },
  ]

  return (
    <div className="ticker-strip">
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <div className="ticker-divider" />}
          <div className="ticker-item">
            <span className="ticker-label">{item.label}</span>
            <span
              className={`ticker-value ${flash[item.key] === 'up' ? 'flash-up' : flash[item.key] === 'dn' ? 'flash-dn' : ''}`}
              style={{ color: item.color }}
            >
              {flash[item.key] === 'up' ? '▲ ' : flash[item.key] === 'dn' ? '▼ ' : ''}
              {item.value?.toLocaleString()}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Nav cards ────────────────────────────────────────────────────────────────
const NAV_CARDS = [
  {
    id: 'emergency', label: 'Emergency Search',
    desc: 'Find the best hospital for your medical problem right now',
    colorClass: 'nav-emergency',
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  },
  {
    id: 'list', label: 'Hospital List',
    desc: 'Browse, search and filter all hospitals across Bangladesh',
    colorClass: 'nav-list',
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/></svg>,
  },
  {
    id: 'stats', label: 'Statistics',
    desc: 'View analytics and distribution of hospitals by region and type',
    colorClass: 'nav-stats',
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    id: 'create', label: 'Add Hospital',
    desc: 'Register a new hospital to the national database',
    colorClass: 'nav-create',
    icon: <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="12" y1="5" x2="12" y2="9"/><line x1="10" y1="7" x2="14" y2="7"/></svg>,
  },
]

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, onNavigate }) {
  const now = useClock()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    apiService.getStatistics()
      .then(res => setStats(res.data))
      .catch(() => {})
  }, [])

  const greeting  = getGreeting(now.getHours())
  const firstName = user?.firstName || 'there'

  return (
    <div className="dashboard">
      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-greeting-block">
          <div className="dash-pulse-ring" />
          <div className="dash-greeting-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="rgba(255,255,255,0.15)"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="white"/>
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div className="dash-greeting-text">
            <span className="dash-greeting-hi">{greeting},</span>
            <span className="dash-greeting-name">{firstName}</span>
          </div>
          <div className="dash-role-pill">{user?.role}</div>
        </div>
        <ClockWidget now={now} />
      </div>

      {/* Body: nav left + charts right */}
      <div className="dash-body">
        {/* Left nav */}
        <aside className="dash-nav-aside">
          <div className="dash-section-label">Navigate</div>
          <div className="dash-nav-list">
            {NAV_CARDS.map((card, i) => (
              <button
                key={card.id}
                className={`dash-nav-card ${card.colorClass}`}
                style={{ animationDelay: `${i * 80}ms` }}
                onClick={() => onNavigate(card.id)}
              >
                <div className="dash-nav-card-glow" />
                <div className="dash-nav-icon">{card.icon}</div>
                <div className="dash-nav-label">{card.label}</div>
                <div className="dash-nav-desc">{card.desc}</div>
                <div className="dash-nav-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Right charts */}
        {stats ? (
          <div className="dash-charts-col">
            <TickerStrip stats={stats} />
            <DivisionChart rawData={stats.byDivision ?? []} />
            <div className="chart-row">
              <TypeChart rawData={stats.byType ?? []} />
              <PublicPrivateChart publicCount={stats.publicHospitals} privateCount={stats.privateHospitals} />
            </div>
          </div>
        ) : (
          <div className="dash-charts-col dash-charts-placeholder">
            <div className="chart-skeleton" />
            <div className="chart-skeleton chart-skeleton--short" />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
