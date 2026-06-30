import React, { useState } from 'react'
import apiService from '../services/api'
import { useLanguage } from '../context/LanguageContext'
import EmergencyCriteriaEditor from './EmergencyCriteriaEditor'
import './CreateHospital.css'

function CreateHospital({ onSuccess }) {
  const { t } = useLanguage()

  const [formData, setFormData] = useState({
    name: '', nameBangla: '', code: '', email: '', agency: '', type: '',
    division: '', district: '', upazila: '', cityCorporation: '', paurasava: '',
    union: '', latitude: '', longitude: '', private: false, score: 50,
    emergencyCriteria: {},
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { setError(t('create.nameRequired')); return }
    if (!formData.code) { setError(t('create.codeRequired')); return }
    try {
      setLoading(true)
      setError(null)
      await apiService.createHospital({
        ...formData,
        code: parseInt(formData.code, 10),
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
      })
      setSuccess(t('create.success'))
      setTimeout(() => {
        setFormData({ name: '', nameBangla: '', code: '', email: '', agency: '', type: '', division: '', district: '', upazila: '', cityCorporation: '', paurasava: '', union: '', latitude: '', longitude: '', private: false, score: 50, emergencyCriteria: {} })
        onSuccess?.()
      }, 1500)
    } catch (err) {
      setError(err.message || t('create.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-hospital">
      <div className="create-header">
        <div>
          <h2 className="page-title">{t('create.title')}</h2>
          <p className="page-subtitle">{t('create.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-form">
        {error && <div className="form-alert form-alert-error">{error}</div>}
        {success && <div className="form-alert form-alert-success">{success}</div>}

        {/* Section 1 — Basic Information */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-number">1</span>
            <h3 className="form-section-title">{t('s1')}</h3>
          </div>
          <div className="form-grid">
            <div className="form-group required">
              <label htmlFor="name">{t('create.name')}</label>
              <input id="name" type="text" name="name" placeholder={t('create.namePlaceholder')} value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="nameBangla">{t('create.nameBangla')}</label>
              <input id="nameBangla" type="text" name="nameBangla" placeholder={t('create.nameBanglaPlaceholder')} value={formData.nameBangla} onChange={handleChange} />
            </div>
            <div className="form-group required">
              <label htmlFor="code">{t('create.code')}</label>
              <input id="code" type="number" name="code" placeholder={t('create.codePlaceholder')} value={formData.code} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">{t('create.email')}</label>
              <input id="email" type="email" name="email" placeholder={t('create.emailPlaceholder')} value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Section 2 — Classification */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-number">2</span>
            <h3 className="form-section-title">{t('s2')}</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">{t('create.type')}</label>
              <input id="type" type="text" name="type" placeholder={t('create.typePlaceholder')} value={formData.type} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="agency">{t('create.agency')}</label>
              <input id="agency" name="agency" placeholder={t('create.agencyPlaceholder')} value={formData.agency} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="score">{t('create.score')}</label>
              <div className="score-input-wrapper">
                <input id="score" type="range" name="score" min="0" max="100" value={formData.score} onChange={handleChange} className="score-range" />
                <span className="score-display">{formData.score}</span>
              </div>
              <p className="checkbox-hint">{t('create.scoreHint')}</p>
            </div>
            <div className="form-group checkbox-form-group">
              <label className="checkbox-form-label">
                <input type="checkbox" name="private" checked={formData.private} onChange={handleChange} />
                <span>{t('create.private')}</span>
              </label>
              <p className="checkbox-hint">{t('create.privateHint')}</p>
            </div>
          </div>
        </div>

        {/* Section 3 — Emergency Criteria */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-number">3</span>
            <h3 className="form-section-title">Emergency Criteria &amp; Scores</h3>
          </div>
          <EmergencyCriteriaEditor
            criteria={formData.emergencyCriteria}
            onChange={val => setFormData(prev => ({ ...prev, emergencyCriteria: val }))}
          />
        </div>

        {/* Section 4 — Location */}
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-number">4</span>
            <h3 className="form-section-title">{t('s4')}</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="division">{t('create.division')}</label>
              <input id="division" type="text" name="division" placeholder={t('create.divisionPlaceholder')} value={formData.division} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="district">{t('create.district')}</label>
              <input id="district" type="text" name="district" placeholder={t('create.districtPlaceholder')} value={formData.district} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="upazila">{t('create.upazila')}</label>
              <input id="upazila" type="text" name="upazila" placeholder={t('create.upazilaPlaceholder')} value={formData.upazila} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="cityCorporation">{t('create.city')}</label>
              <input id="cityCorporation" type="text" name="cityCorporation" placeholder={t('create.applicable')} value={formData.cityCorporation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="paurasava">{t('create.paurasava')}</label>
              <input id="paurasava" type="text" name="paurasava" placeholder={t('create.applicable')} value={formData.paurasava} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="union">{t('create.union')}</label>
              <input id="union" type="text" name="union" placeholder={t('create.applicable')} value={formData.union} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="latitude">{t('create.lat')}</label>
              <input id="latitude" type="number" name="latitude" step="any" placeholder={t('create.latPlaceholder')} value={formData.latitude} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">{t('create.lng')}</label>
              <input id="longitude" type="number" name="longitude" step="any" placeholder={t('create.lngPlaceholder')} value={formData.longitude} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <p className="form-required-note">{t('create.required')}</p>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <><span className="btn-spinner" />{t('create.creating')}</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {t('create.submit')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateHospital
