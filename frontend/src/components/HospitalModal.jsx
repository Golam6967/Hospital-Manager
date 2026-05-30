import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import './HospitalModal.css'

function HospitalModal({ hospital, isEditing, onClose, onRefresh }) {
  const [formData, setFormData] = useState(hospital || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    setFormData(hospital || {})
    setError(null)
    setSuccess(null)
  }, [hospital])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      setError('Hospital name is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (isEditing && formData._id) {
        const { _id, createdAt, updatedAt, ...updates } = formData
        await apiService.updateHospital(_id, updates)
        setSuccess('Hospital updated successfully!')
      } else {
        await apiService.createHospital(formData)
        setSuccess('Hospital created successfully!')
      }

      setTimeout(() => {
        onRefresh?.()
        onClose?.()
      }, 1500)
    } catch (err) {
      console.error('[v0] Error saving hospital:', err)
      setError(err.message || 'Failed to save hospital')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Hospital' : 'Hospital Details'}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Hospital Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nameBangla">Name (Bangla)</label>
                  <input
                    id="nameBangla"
                    type="text"
                    name="nameBangla"
                    value={formData.nameBangla || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="code">Code *</label>
                  <input
                    id="code"
                    type="number"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="agency">Agency</label>
                  <input
                    id="agency"
                    type="text"
                    name="agency"
                    value={formData.agency || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type</label>
                  <input
                    id="type"
                    type="text"
                    name="type"
                    value={formData.type || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="division">Division</label>
                  <input
                    id="division"
                    type="text"
                    name="division"
                    value={formData.division || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="district">District</label>
                  <input
                    id="district"
                    type="text"
                    name="district"
                    value={formData.district || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="upazila">Upazila</label>
                  <input
                    id="upazila"
                    type="text"
                    name="upazila"
                    value={formData.upazila || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cityCorporation">City Corporation</label>
                  <input
                    id="cityCorporation"
                    type="text"
                    name="cityCorporation"
                    value={formData.cityCorporation || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="paurasava">Paurasava</label>
                  <input
                    id="paurasava"
                    type="text"
                    name="paurasava"
                    value={formData.paurasava || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="union">Union</label>
                  <input
                    id="union"
                    type="text"
                    name="union"
                    value={formData.union || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label htmlFor="private">
                    <input
                      id="private"
                      type="checkbox"
                      name="private"
                      checked={formData.private || false}
                      onChange={handleChange}
                    />
                    <span>Private Hospital</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="details-view">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{formData.name}</span>
              </div>
              {formData.nameBangla && (
                <div className="detail-row">
                  <strong>Name (Bangla):</strong>
                  <span>{formData.nameBangla}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Code:</strong>
                <span>{formData.code}</span>
              </div>
              {formData.email && (
                <div className="detail-row">
                  <strong>Email:</strong>
                  <span><a href={`mailto:${formData.email}`}>{formData.email}</a></span>
                </div>
              )}
              {formData.agency && (
                <div className="detail-row">
                  <strong>Agency:</strong>
                  <span>{formData.agency}</span>
                </div>
              )}
              {formData.type && (
                <div className="detail-row">
                  <strong>Type:</strong>
                  <span>{formData.type}</span>
                </div>
              )}
              {formData.division && (
                <div className="detail-row">
                  <strong>Division:</strong>
                  <span>{formData.division}</span>
                </div>
              )}
              {formData.district && (
                <div className="detail-row">
                  <strong>District:</strong>
                  <span>{formData.district}</span>
                </div>
              )}
              {formData.upazila && (
                <div className="detail-row">
                  <strong>Upazila:</strong>
                  <span>{formData.upazila}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status ${formData.private ? 'private' : 'public'}`}>
                  {formData.private ? '🔒 Private' : '🔓 Public'}
                </span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(formData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <strong>Updated:</strong>
                <span>{new Date(formData.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HospitalModal
