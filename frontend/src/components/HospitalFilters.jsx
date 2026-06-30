import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import "./HospitalFilters.css";

function HospitalFilters({ onFilterChange, filters }) {
  const { t } = useLanguage()
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [types, setTypes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => { loadFilterOptions() }, []);

  const loadFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      const [divisionData, districtData, upazilaData, typeData, agencyData] = await Promise.all([
        apiService.getDistinctValues("division"),
        apiService.getDistinctValues("district"),
        apiService.getDistinctValues("upazila"),
        apiService.getDistinctValues("type"),
        apiService.getDistinctValues("agency"),
      ]);
      setDivisions(divisionData.data || []);
      setDistricts(districtData.data || []);
      setUpazilas(upazilaData.data || []);
      setTypes(typeData.data || []);
      setAgencies(agencyData.data || []);
    } catch (error) {
      console.error("[v0] Error loading filter options:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleChange = (field, value) => onFilterChange({ ...filters, [field]: value });

  const handleReset = () => onFilterChange({ division: "", district: "", upazila: "", type: "", agency: "", private: "", name: "" });

  const hasActiveFilters = Object.entries(filters)
    .filter(([key]) => key !== "name")
    .some(([, val]) => val !== "" && val != null);

  if (loadingOptions) {
    return (
      <div className="hospital-filters">
        <div className="filters-loading">
          <div className="filters-loading-spinner" />
          <span>{t('filters.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="hospital-filters">
      <div className="filters-header">
        <h3 className="filter-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {t('filters.title')}
        </h3>
        {hasActiveFilters && (
          <button className="btn-clear-inline" onClick={handleReset}>{t('filters.clearAll')}</button>
        )}
      </div>

      <div className="filters-body">
        <div className="filter-group">
          <label htmlFor="division">{t('filters.division')}</label>
          <select id="division" value={filters.division} onChange={e => handleChange("division", e.target.value)} disabled={loadingOptions}>
            <option value="">{t('filters.allDivisions')}</option>
            {divisions.map(div => <option key={div} value={div}>{div}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="district">{t('filters.district')}</label>
          <select id="district" value={filters.district} onChange={e => handleChange("district", e.target.value)} disabled={loadingOptions}>
            <option value="">{t('filters.allDistricts')}</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="upazila">{t('filters.upazila')}</label>
          <select id="upazila" value={filters.upazila} onChange={e => handleChange("upazila", e.target.value)} disabled={loadingOptions}>
            <option value="">{t('filters.allUpazilas')}</option>
            {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type">{t('filters.type')}</label>
          <select id="type" value={filters.type} onChange={e => handleChange("type", e.target.value)} disabled={loadingOptions}>
            <option value="">{t('filters.allTypes')}</option>
            {types.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="agency">{t('filters.agency')}</label>
          <select id="agency" value={filters.agency} onChange={e => handleChange("agency", e.target.value)} disabled={loadingOptions}>
            <option value="">{t('filters.allAgencies')}</option>
            {agencies.map(ag => <option key={ag} value={ag}>{ag}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="private">{t('filters.ownership')}</label>
          <select id="private" value={filters.private} onChange={e => handleChange("private", e.target.value)}>
            <option value="">{t('filters.all')}</option>
            <option value="true">{t('filters.private')}</option>
            <option value="false">{t('filters.public')}</option>
          </select>
        </div>
      </div>

      <div className="filters-footer">
        <button className="btn-reset" onClick={handleReset}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          {t('filters.clearFilters')}
        </button>
      </div>
    </div>
  );
}

export default HospitalFilters;
