import React, { useState } from 'react'
import apiService from '../services/api'
import './CreateHospital.css'

function CreateHospital({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    nameBangla: '',
    code: '',
    email: '',
    agency: '',
    type: '',
    division: '',
    district: '',
    upazila: '',
    cityCorporation: '',
    paurasava: '',
    union: '',
    private: false,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Hospital name is required')
      return
    }

    if (!formData.code) {
      setError('Hospital code is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dataToSend = {
        ...formData,
        code: parseInt(formData.code, 10),
      }

      await apiService.createHospital(dataToSend)
      setSuccess('Hospital created successfully!')

      setTimeout(() => {
        setFormData({
          name: '',
          nameBangla: '',
          code: '',
          email: '',
          agency: '',
          type: '',
          division: '',
          district: '',
          upazila: '',
          cityCorporation: '',
          paurasava: '',
          union: '',
          private: false,
        })
        onSuccess?.()
      }, 1500)
    } catch (err) {
      console.error('[v0] Error creating hospital:', err)
      setError(err.message || 'Failed to create hospital. Please check the error details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-hospital">
      <h2>➕ Add New Hospital</h2>

      <form onSubmit={handleSubmit} className="create-form">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Hospital Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter hospital name"
                value={formData.name}
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
                placeholder="এনটার করুন হাসপাতালের নাম"
                value={formData.nameBangla}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="code">Code *</label>
              <input
                id="code"
                type="number"
                name="code"
                placeholder="Enter unique code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="example@hospital.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Classification</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Hospital Type</label>
              <input
                id="type"
                type="text"
                name="type"
                placeholder="e.g., Medical College Hospital"
                value={formData.type}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="agency">Agency</label>
              <input
                id="agency"
                name="agency"
                placeholder="e.g., Government, Private, NGO"
                value={formData.agency}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="private">
                <input
                  id="private"
                  type="checkbox"
                  name="private"
                  checked={formData.private}
                  onChange={handleChange}
                />
                <span>Private Hospital</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Location</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="division">Division</label>
              <input
                id="division"
                type="text"
                name="division"
                placeholder="e.g., Dhaka, Chittagong"
                value={formData.division}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                id="district"
                type="text"
                name="district"
                placeholder="Enter district"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="upazila">Upazila</label>
              <input
                id="upazila"
                type="text"
                name="upazila"
                placeholder="Enter upazila"
                value={formData.upazila}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cityCorporation">City Corporation</label>
              <input
                id="cityCorporation"
                type="text"
                name="cityCorporation"
                placeholder="Enter city corporation"
                value={formData.cityCorporation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="paurasava">Paurasava</label>
              <input
                id="paurasava"
                type="text"
                name="paurasava"
                placeholder="Enter paurasava"
                value={formData.paurasava}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="union">Union</label>
              <input
                id="union"
                type="text"
                name="union"
                placeholder="Enter union"
                value={formData.union}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? '⏳ Creating...' : '✓ Create Hospital'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateHospital
