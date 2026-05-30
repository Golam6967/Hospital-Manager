import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import './HospitalFilters.css'

function HospitalFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    division: '',
    district: '',
    upazila: '',
    type: '',
    agency: '',
    private: '',
    name: '',
  })

  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [upazilas, setUpazilas] = useState([])
  const [types, setTypes] = useState([])
  const [agencies, setAgencies] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      setLoadingOptions(true)
      const [divisionData, districtData, upazilaData, typeData, agencyData] = await Promise.all([
        apiService.getDistinctValues('division'),
        apiService.getDistinctValues('district'),
        apiService.getDistinctValues('upazila'),
        apiService.getDistinctValues('type'),
        apiService.getDistinctValues('agency'),
      ])

      setDivisions(divisionData.data || [])
      setDistricts(districtData.data || [])
      setUpazilas(upazilaData.data || [])
      setTypes(typeData.data || [])
      setAgencies(agencyData.data || [])
    } catch (error) {
      console.error('[v0] Error loading filter options:', error)
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const emptyFilters = {
      division: '',
      district: '',
      upazila: '',
      type: '',
      agency: '',
      private: '',
      name: '',
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="hospital-filters">
      <h3 className="filter-title">🔍 Advanced Filters</h3>
      
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="name">Hospital Name</label>
          <input
            id="name"
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="division">Division</label>
          <select
            id="division"
            value={filters.division}
            onChange={(e) => handleFilterChange('division', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All Divisions</option>
            {divisions.map((div) => (
              <option key={div} value={div}>{div}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="district">District</label>
          <select
            id="district"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All Districts</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>{dist}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="upazila">Upazila</label>
          <select
            id="upazila"
            value={filters.upazila}
            onChange={(e) => handleFilterChange('upazila', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All Upazilas</option>
            {upazilas.map((upaz) => (
              <option key={upaz} value={upaz}>{upaz}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type">Hospital Type</label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="agency">Agency</label>
          <select
            id="agency"
            value={filters.agency}
            onChange={(e) => handleFilterChange('agency', e.target.value)}
            disabled={loadingOptions}
          >
            <option value="">All Agencies</option>
            {agencies.map((agency) => (
              <option key={agency} value={agency}>{agency}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="private">Private Status</label>
          <select
            id="private"
            value={filters.private}
            onChange={(e) => handleFilterChange('private', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="true">Private Only</option>
            <option value="false">Public Only</option>
          </select>
        </div>
      </div>

      <div className="filters-actions">
        <button className="btn-reset" onClick={handleReset}>
          ✕ Reset Filters
        </button>
      </div>
    </div>
  )
}

export default HospitalFilters
