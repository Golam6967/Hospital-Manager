import React, { useState } from 'react'
import apiService from '../services/api'
import MapPanel from './MapPanel'
import { useLanguage } from '../context/LanguageContext'
import './EmergencySearch.css'

const PROBLEM_TYPE_IDS = ['cut', 'neurological', 'bone', 'cardiac', 'respiratory', 'burn', 'maternity', 'paediatric', 'poisoning', 'cancer', 'trauma', 'other']

const PROBLEM_ICONS = {
  cut: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"/>
      <path d="M8 12h8M12 8v8"/>
    </svg>
  ),
  neurological: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-4.24z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-4.24z"/>
    </svg>
  ),
  bone: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.5 5.5a4.5 4.5 0 0 0-4.36 3.35L8.5 14.5a4.5 4.5 0 1 0 1.41 1.41l5.65-5.65A4.5 4.5 0 1 0 18.5 5.5z"/>
    </svg>
  ),
  cardiac: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  respiratory: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8M4.93 10.93l1.41 1.41M2 18h2M20 18h2M19.07 10.93l-1.41 1.41M22 22H2M16 6l-4 4-4-4"/>
      <path d="M12 10c0 4-4 6-4 10h8c0-4-4-6-4-10z"/>
    </svg>
  ),
  burn: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-1.5-.8-2.5-1.5-3.5S12 9 12 7c0 0-3.5 2-3.5 7.5z"/>
      <path d="M12 7c0-2 1-4 3-5-1 2-1 4 1 5 1.5 1 2 2.5 2 4a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3.5 3 2z"/>
    </svg>
  ),
  maternity: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="3"/>
      <path d="M9 20h6M12 11v9"/>
      <path d="M9 14c-2 1-3 2.5-3 4h12c0-1.5-1-3-3-4"/>
    </svg>
  ),
  paediatric: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3"/>
      <path d="M12 11v5M10 16h4M7 21a5 5 0 0 1 10 0"/>
      <path d="M6 10c-1 0-2 .5-2 1.5S5 13 6 13M18 10c1 0 2 .5 2 1.5S19 13 18 13"/>
    </svg>
  ),
  poisoning: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6l1 3H8L9 3z"/>
      <path d="M8 6c-2 1-3 3-3 5v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7c0-2-1-4-3-5"/>
      <line x1="12" y1="11" x2="12" y2="15"/>
      <line x1="10" y1="13" x2="14" y2="13"/>
    </svg>
  ),
  cancer: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
    </svg>
  ),
  trauma: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <path d="M9 22V12h6v10"/>
      <path d="M12 7v.01"/>
      <circle cx="12" cy="7" r="1" fill="currentColor"/>
    </svg>
  ),
  other: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
}

function ScoreBar({ score }) {
  const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
  return (
    <div className="score-bar-wrapper">
      <div className="score-bar-track">
        <div className="score-bar-fill" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="score-bar-label" style={{ color }}>{score}/100</span>
    </div>
  )
}

function HospitalResultCard({ hospital, rank, onShowMap, t }) {
  const score = hospital.score ?? 50
  const rankClass = rank === 1 ? 'rank-gold' : rank === 2 ? 'rank-silver' : rank === 3 ? 'rank-bronze' : ''
  return (
    <div className={`result-card ${rank <= 3 ? 'result-card-top' : ''}`}>
      <div className="result-rank">
        <span className={`rank-badge ${rankClass}`}>#{rank}</span>
      </div>
      <div className="result-info">
        <div className="result-name-row">
          <span className="result-name">{hospital.name}</span>
          {hospital.nameBangla && <span className="result-name-bangla">{hospital.nameBangla}</span>}
        </div>
        <div className="result-meta">
          {hospital.type && <span className="result-tag result-tag-type">{hospital.type}</span>}
          <span className={`result-tag ${hospital.private ? 'result-tag-private' : 'result-tag-public'}`}>
            {hospital.private ? t('table.private') : t('table.public')}
          </span>
        </div>
        <div className="result-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{[hospital.district, hospital.division].filter(Boolean).join(', ') || 'Location not listed'}</span>
        </div>
        <ScoreBar score={score} />
      </div>
      <div className="result-right">
        <div className="result-score-display">
          <span className="result-score-number">{score}</span>
          <span className="result-score-unit">pts</span>
        </div>
        <button className="result-map-btn" onClick={() => onShowMap(hospital)} title="Get Directions">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          {t('emergency.directions')}
        </button>
      </div>
    </div>
  )
}

function EmergencySearch() {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [mapHospital, setMapHospital] = useState(null)

  const handleSearch = async () => {
    if (!selectedType) { setError(t('emergency.selectError')); return }
    setError(null)
    setLoading(true)
    try {
      const data = await apiService.getEmergencyHospitals(selectedType)
      setResults(data)
      setStep(2)
    } catch {
      setError(t('emergency.connectionError'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setDescription('')
    setSelectedType(null)
    setResults(null)
    setError(null)
  }

  const selectedTypeLabel = selectedType ? t(`pt.${selectedType}.label`) : ''

  if (step === 2 && results) {
    return (
      <div className="emergency-container">
        {mapHospital && <MapPanel hospital={mapHospital} onClose={() => setMapHospital(null)} />}
        <div className="emergency-results-header">
          <button className="back-btn" onClick={handleReset}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            {t('emergency.newSearch')}
          </button>
          <div className="results-title-block">
            <h2 className="results-title">{t('emergency.resultsTitle')}</h2>
            <p className="results-subtitle">
              {t('emergency.resultsSubtitle', { total: results.total, type: selectedTypeLabel })}
            </p>
          </div>
        </div>

        {description && (
          <div className="description-recap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>"{description}"</span>
          </div>
        )}

        <div className="results-list">
          {results.data.length === 0 ? (
            <div className="results-empty">{t('emergency.noResults')}</div>
          ) : (
            results.data.map((hospital, idx) => (
              <HospitalResultCard key={hospital._id} hospital={hospital} rank={idx + 1} onShowMap={setMapHospital} t={t} />
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="emergency-container">
      <div className="emergency-hero">
        <div className="emergency-hero-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div>
          <h1 className="emergency-title">{t('emergency.title')}</h1>
          <p className="emergency-subtitle">{t('emergency.subtitle')}</p>
        </div>
      </div>

      <div className="emergency-body-grid">
        <div className="emergency-form-card">
          <div className="form-block">
            <label className="form-block-label">
              <span className="form-block-number">1</span>
              {t('emergency.step1')} <span className="optional-tag">{t('emergency.optional')}</span>
            </label>
            <textarea
              className="emergency-textarea"
              placeholder={t('emergency.textareaPlaceholder')}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-block">
            <label className="form-block-label">
              <span className="form-block-number">2</span>
              {t('emergency.step2')} <span className="required-tag">{t('emergency.required')}</span>
            </label>
            <div className="problem-type-grid">
              {PROBLEM_TYPE_IDS.map(id => (
                <button
                  key={id}
                  type="button"
                  className={`problem-type-card ${selectedType === id ? 'selected' : ''}`}
                  onClick={() => { setSelectedType(id); setError(null) }}
                >
                  <div className="problem-type-icon">{PROBLEM_ICONS[id]}</div>
                  <div className="problem-type-label">{t(`pt.${id}.label`)}</div>
                  <div className="problem-type-desc">{t(`pt.${id}.desc`)}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="emergency-error">{error}</div>}

          <button
            className="emergency-submit-btn"
            onClick={handleSearch}
            disabled={loading || !selectedType}
          >
            {loading ? (
              <>
                <span className="btn-spinner-emergency" />
                {t('emergency.findingBtn')}
              </>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {t('emergency.findBtn')}
              </>
            )}
          </button>
        </div>

        <aside className="emergency-info-panel">
          <div className="info-panel-card">
            <div className="info-panel-section">
              <div className="info-panel-heading">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>{t('emergency.hotlineTitle')}</span>
              </div>
              <div className="hotline-list">
                <a href="tel:999" className="hotline-item">
                  <span className="hotline-number">999</span>
                  <span className="hotline-label">{t('emergency.hotline999')}</span>
                </a>
                <a href="tel:16321" className="hotline-item">
                  <span className="hotline-number">16321</span>
                  <span className="hotline-label">{t('emergency.hotline16321')}</span>
                </a>
                <a href="tel:199" className="hotline-item">
                  <span className="hotline-number">199</span>
                  <span className="hotline-label">{t('emergency.hotline199')}</span>
                </a>
              </div>
            </div>

            <div className="info-panel-divider" />

            <div className="info-panel-section">
              <div className="info-panel-heading">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{t('emergency.howTitle')}</span>
              </div>
              <ol className="how-it-works-list">
                <li><span className="how-step-num">1</span><span>{t('emergency.how1')}</span></li>
                <li><span className="how-step-num">2</span><span>{t('emergency.how2')}</span></li>
                <li><span className="how-step-num">3</span><span>{t('emergency.how3')}</span></li>
              </ol>
            </div>

            <div className="info-panel-divider" />

            <p className="info-trust-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {t('emergency.trustNote')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EmergencySearch
