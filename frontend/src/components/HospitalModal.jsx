import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import MapPanel from "./MapPanel";
import { useLanguage } from "../context/LanguageContext";
import EmergencyCriteriaEditor, { SPECIALTY_META } from "./EmergencyCriteriaEditor";
import "./HospitalModal.css";

const HospitalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function HospitalModal({ hospital, isEditing, onClose, onRefresh }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState(hospital || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    setFormData(hospital || {});
    setError(null);
    setSuccess(null);
  }, [hospital]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) { setError(t('modal.nameRequired')); return; }
    try {
      setLoading(true);
      setError(null);
      if (isEditing && formData._id) {
        const { _id, createdAt, updatedAt, ...updates } = formData;
        await apiService.updateHospital(_id, updates);
        setSuccess(t('modal.updatedSuccess'));
      } else {
        await apiService.createHospital(formData);
        setSuccess(t('modal.createdSuccess'));
      }
      setTimeout(() => { onRefresh?.(); onClose?.(); }, 1500);
    } catch (err) {
      setError(err.message || t('modal.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon"><HospitalIcon /></div>
            <h2>{isEditing ? t('modal.editTitle') : t('modal.viewTitle')}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">{t('modal.hospitalName')}</label>
                  <input id="name" type="text" name="name" value={formData.name || ""} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="nameBangla">{t('modal.nameBangla')}</label>
                  <input id="nameBangla" type="text" name="nameBangla" value={formData.nameBangla || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="code">{t('modal.code')}</label>
                  <input id="code" type="number" name="code" value={formData.code || ""} onChange={handleChange} required disabled />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('modal.email')}</label>
                  <input id="email" type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="agency">{t('modal.agency')}</label>
                  <input id="agency" type="text" name="agency" value={formData.agency || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="type">{t('modal.type')}</label>
                  <input id="type" type="text" name="type" value={formData.type || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="division">{t('modal.division')}</label>
                  <input id="division" type="text" name="division" value={formData.division || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="district">{t('modal.district')}</label>
                  <input id="district" type="text" name="district" value={formData.district || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="upazila">{t('modal.upazila')}</label>
                  <input id="upazila" type="text" name="upazila" value={formData.upazila || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="cityCorporation">{t('modal.cityCorporation')}</label>
                  <input id="cityCorporation" type="text" name="cityCorporation" value={formData.cityCorporation || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="paurasava">{t('modal.paurasava')}</label>
                  <input id="paurasava" type="text" name="paurasava" value={formData.paurasava || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="union">{t('modal.union')}</label>
                  <input id="union" type="text" name="union" value={formData.union || ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="latitude">{t('create.lat')}</label>
                  <input id="latitude" type="number" name="latitude" step="any" placeholder="e.g. 23.8103" value={formData.latitude ?? ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">{t('create.lng')}</label>
                  <input id="longitude" type="number" name="longitude" step="any" placeholder="e.g. 90.4125" value={formData.longitude ?? ""} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="score">{t('modal.adminScore')}</label>
                  <div className="modal-score-wrapper">
                    <input id="score" type="range" name="score" min="0" max="100" value={formData.score ?? 50} onChange={handleChange} className="modal-score-range" />
                    <span className="modal-score-display">{formData.score ?? 50}</span>
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" name="private" checked={formData.private || false} onChange={handleChange} />
                    <span>{t('modal.privateLabel')}</span>
                  </label>
                </div>
              </div>

              <div className="modal-criteria-section">
                <div className="modal-criteria-title">Emergency Criteria &amp; Scores</div>
                <EmergencyCriteriaEditor
                  criteria={
                    formData.emergencyCriteria instanceof Map
                      ? Object.fromEntries(formData.emergencyCriteria)
                      : (formData.emergencyCriteria || {})
                  }
                  onChange={val => setFormData(prev => ({ ...prev, emergencyCriteria: val }))}
                />
              </div>
            </form>
          ) : (
            <div className="details-view">
              <p className="details-section-title">{t('modal.basicInfo')}</p>
              <div className="detail-row">
                <span className="detail-label">{t('modal.hospitalName').replace(' *','')}</span>
                <span className="detail-value">{formData.name}</span>
              </div>
              {formData.nameBangla && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.nameBangla')}</span>
                  <span className="detail-value">{formData.nameBangla}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">{t('modal.code')}</span>
                <span className="detail-value">{formData.code}</span>
              </div>
              {formData.email && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.email')}</span>
                  <span className="detail-value"><a href={`mailto:${formData.email}`}>{formData.email}</a></span>
                </div>
              )}

              <p className="details-section-title">{t('modal.classification')}</p>
              {formData.agency && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.agency')}</span>
                  <span className="detail-value">{formData.agency}</span>
                </div>
              )}
              {formData.type && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.type')}</span>
                  <span className="detail-value">{formData.type}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">{t('modal.ownership')}</span>
                <span className="detail-value">
                  <span className={`status-badge ${formData.private ? "private" : "public"}`}>
                    <span className="status-dot-badge" />
                    {formData.private ? t('modal.private') : t('modal.public')}
                  </span>
                </span>
              </div>

              <p className="details-section-title">{t('modal.location')}</p>
              {formData.division && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.division')}</span>
                  <span className="detail-value">{formData.division}</span>
                </div>
              )}
              {formData.district && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.district')}</span>
                  <span className="detail-value">{formData.district}</span>
                </div>
              )}
              {formData.upazila && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.upazila')}</span>
                  <span className="detail-value">{formData.upazila}</span>
                </div>
              )}
              {formData.latitude != null && formData.longitude != null && (
                <div className="detail-row">
                  <span className="detail-label">{t('modal.coordinates')}</span>
                  <span className="detail-value">{formData.latitude}, {formData.longitude}</span>
                </div>
              )}

              <p className="details-section-title">{t('modal.quality')}</p>
              <div className="detail-row">
                <span className="detail-label">{t('modal.adminScore').replace(' (0–100)','').replace(' (০–১০০)','')}</span>
                <span className="detail-value">
                  <span className="modal-score-badge">{formData.score ?? 50} / 100</span>
                  <div className="modal-score-bar-track">
                    <div className="modal-score-bar-fill" style={{
                      width: `${formData.score ?? 50}%`,
                      backgroundColor: (formData.score ?? 50) >= 80 ? "#16a34a" : (formData.score ?? 50) >= 60 ? "#d97706" : "#dc2626",
                    }} />
                  </div>
                </span>
              </div>

              {(() => {
                const ec = formData.emergencyCriteria instanceof Map
                  ? Object.fromEntries(formData.emergencyCriteria)
                  : (formData.emergencyCriteria || {})
                const entries = Object.entries(ec).filter(([, v]) => v > 0)
                return entries.length > 0 ? (
                  <>
                    <p className="details-section-title">Emergency Criteria</p>
                    <div className="modal-criteria-chips">
                      {entries.sort((a, b) => b[1] - a[1]).map(([type, score]) => {
                        const color = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626'
                        return (
                          <div key={type} className="modal-criteria-chip">
                            <span className="modal-criteria-chip-icon">{SPECIALTY_META[type]?.icon}</span>
                            <span className="modal-criteria-chip-label">{SPECIALTY_META[type]?.label ?? type}</span>
                            <span className="modal-criteria-chip-score" style={{ color }}>{score}</span>
                          </div>
                        )
                      })}
                    </div>
                  </>
                ) : null
              })()}

              <p className="details-section-title">{t('modal.record')}</p>
              <div className="detail-row">
                <span className="detail-label">{t('modal.created')}</span>
                <span className="detail-value">{new Date(formData.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('modal.updated')}</span>
                <span className="detail-value">{new Date(formData.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {isEditing ? (
            <>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>{t('modal.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={loading} onClick={handleSubmit}>
                {loading ? t('modal.saving') : t('modal.save')}
              </button>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={onClose}>{t('modal.close')}</button>
              <button className="btn-primary" onClick={() => setShowMap(true)}>{t('modal.viewMap')}</button>
            </>
          )}
        </div>
      </div>
      {showMap && <MapPanel hospital={formData} onClose={() => setShowMap(false)} />}
    </div>
  );
}

export default HospitalModal;
