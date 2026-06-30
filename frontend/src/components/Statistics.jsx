import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorAlert from './ErrorAlert'
import { useLanguage } from '../context/LanguageContext'
import './Statistics.css'

const RefreshIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
)

function SummaryCard({ value, label, subtitle, colorClass }) {
  return (
    <div className={`summary-card ${colorClass}`}>
      <div className="summary-value">{value?.toLocaleString()}</div>
      <div className="summary-label">{label}</div>
      {subtitle && <div className="summary-sub">{subtitle}</div>}
    </div>
  )
}

function Statistics() {
  const { t } = useLanguage()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchStatistics() }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getStatistics()
      setStats(data.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} onRetry={fetchStatistics} />
  if (!stats) return <div className="empty-state">{t('stats.noStats')}</div>

  const publicPct = ((stats.publicHospitals / stats.totalHospitals) * 100).toFixed(1)
  const privatePct = ((stats.privateHospitals / stats.totalHospitals) * 100).toFixed(1)

  return (
    <div className="statistics">
      <div className="stats-page-header">
        <div>
          <h2 className="page-title">{t('stats.title')}</h2>
          <p className="page-subtitle">{t('stats.subtitle')}</p>
        </div>
        <button className="btn-refresh" onClick={fetchStatistics}>
          <RefreshIcon />
          {t('stats.refresh')}
        </button>
      </div>

      <div className="stats-layout">
        <aside className="stats-sidebar">
          <div className="stats-sidebar-inner">
            <div className="stats-sidebar-heading">{t('stats.overview')}</div>
            <SummaryCard value={stats.totalHospitals} label={t('stats.total')} colorClass="sc-blue" />
            <SummaryCard value={stats.publicHospitals} label={t('stats.public')} subtitle={`${publicPct}${t('stats.ofTotal')}`} colorClass="sc-green" />
            <SummaryCard value={stats.privateHospitals} label={t('stats.private')} subtitle={`${privatePct}${t('stats.ofTotal')}`} colorClass="sc-red" />
          </div>
        </aside>

        <div className="stats-main">
          {stats.byType && stats.byType.length > 0 && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h3 className="stats-section-title">{t('stats.byType')}</h3>
                <span className="stats-section-count">{t('stats.types', { n: stats.byType.length })}</span>
              </div>
              <div className="stats-table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>{t('stats.colType')}</th>
                      <th>{t('stats.count')}</th>
                      <th>{t('stats.share')}</th>
                      <th className="bar-col">{t('stats.distribution')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byType.map((item, idx) => {
                      const pct = ((item.count / stats.totalHospitals) * 100).toFixed(1)
                      return (
                        <tr key={idx}>
                          <td className="type-name">{item._id || t('stats.unknown')}</td>
                          <td className="count-cell">{item.count.toLocaleString()}</td>
                          <td className="pct-cell">{pct}%</td>
                          <td className="bar-col">
                            <div className="bar-track"><div className="bar bar-blue" style={{ width: `${pct}%` }} /></div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {stats.byDivision && stats.byDivision.length > 0 && (
            <div className="stats-section">
              <div className="stats-section-header">
                <h3 className="stats-section-title">{t('stats.byDivision')}</h3>
                <span className="stats-section-count">{t('stats.divisions', { n: stats.byDivision.length })}</span>
              </div>
              <div className="stats-table-wrapper">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>{t('stats.colDivision')}</th>
                      <th>{t('stats.count')}</th>
                      <th>{t('stats.share')}</th>
                      <th className="bar-col">{t('stats.distribution')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byDivision.map((item, idx) => {
                      const pct = ((item.count / stats.totalHospitals) * 100).toFixed(1)
                      return (
                        <tr key={idx}>
                          <td className="type-name">{item._id || t('stats.unknown')}</td>
                          <td className="count-cell">{item.count.toLocaleString()}</td>
                          <td className="pct-cell">{pct}%</td>
                          <td className="bar-col">
                            <div className="bar-track"><div className="bar bar-green" style={{ width: `${pct}%` }} /></div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Statistics
