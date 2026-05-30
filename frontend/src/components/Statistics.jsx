import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ErrorAlert from './ErrorAlert'
import './Statistics.css'

function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getStatistics()
      setStats(data.data)
    } catch (err) {
      console.error('[v0] Error fetching statistics:', err)
      setError(err.message || 'Failed to fetch statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={fetchStatistics} />
  }

  if (!stats) {
    return <div className="empty-state">No statistics available</div>
  }

  return (
    <div className="statistics">
      <h2>📊 Hospital Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card main-card">
          <div className="stat-value">{stats.totalHospitals?.toLocaleString()}</div>
          <div className="stat-label">Total Hospitals</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.publicHospitals?.toLocaleString()}</div>
          <div className="stat-label">Public Hospitals</div>
          <div className="stat-percentage">
            {((stats.publicHospitals / stats.totalHospitals) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.privateHospitals?.toLocaleString()}</div>
          <div className="stat-label">Private Hospitals</div>
          <div className="stat-percentage">
            {((stats.privateHospitals / stats.totalHospitals) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {stats.byType && stats.byType.length > 0 && (
        <div className="stats-section">
          <h3>Hospitals by Type</h3>
          <div className="chart-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {stats.byType.map((item, idx) => {
                  const percentage = ((item.count / stats.totalHospitals) * 100).toFixed(1)
                  return (
                    <tr key={idx}>
                      <td className="type-name">{item._id}</td>
                      <td className="count">{item.count.toLocaleString()}</td>
                      <td className="percentage">{percentage}%</td>
                      <td>
                        <div className="bar-container">
                          <div
                            className="bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
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
          <h3>Hospitals by Division</h3>
          <div className="chart-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Division</th>
                  <th>Count</th>
                  <th>Percentage</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {stats.byDivision.map((item, idx) => {
                  const percentage = ((item.count / stats.totalHospitals) * 100).toFixed(1)
                  return (
                    <tr key={idx}>
                      <td className="division-name">{item._id}</td>
                      <td className="count">{item.count.toLocaleString()}</td>
                      <td className="percentage">{percentage}%</td>
                      <td>
                        <div className="bar-container">
                          <div
                            className="bar division-bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="stats-actions">
        <button className="btn-refresh" onClick={fetchStatistics}>
          🔄 Refresh Statistics
        </button>
      </div>
    </div>
  )
}

export default Statistics
