import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import HospitalFilters from "./HospitalFilters";
import HospitalTable from "./HospitalTable";
import Pagination from "./Pagination";
import ErrorAlert from "./ErrorAlert";
import LoadingSpinner from "./LoadingSpinner";
import { useLanguage } from "../context/LanguageContext";
import "./HospitalList.css";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

function HospitalList({ onRefresh }) {
  const { t } = useLanguage()
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ division: "", district: "", upazila: "", type: "", agency: "", private: "", name: "" });
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => { fetchData() }, [page, limit, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = hasActiveFilters
        ? await apiService.filterHospitals(filters, page, limit)
        : await apiService.getAllHospitals(page, limit);
      setHospitals(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setPage(data.page || 1);
    } catch (err) {
      setError(err.message || "Failed to fetch hospitals. Please check if the API server is running.");
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setHasActiveFilters(Object.values(newFilters).some(v => v !== undefined && v !== null && v !== ""));
    setPage(1);
  };

  const handleNameChange = (name) => handleFilterChange({ ...filters, name });

  const handleDelete = async (id) => {
    if (!window.confirm(t('hl.deleteConfirm'))) return;
    try {
      setLoading(true);
      await apiService.deleteHospital(id);
      setError(null);
      fetchData();
      onRefresh?.();
    } catch (err) {
      setError(`Failed to delete hospital: ${err.message}`);
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (error && !hospitals.length) {
    return (
      <div className="hospital-list">
        <div className="hl-page-header"><h2 className="page-title">{t('hl.title')}</h2></div>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="hospital-list">
      <div className="hl-page-header">
        <div>
          <h2 className="page-title">{t('hl.title')}</h2>
          <p className="page-subtitle">{t('hl.subtitle')}</p>
        </div>
      </div>

      <div className="hl-search-bar">
        <span className="hl-search-icon"><SearchIcon /></span>
        <input
          type="text"
          className="hl-search-input"
          placeholder={t('hl.searchPlaceholder')}
          value={filters.name}
          onChange={e => handleNameChange(e.target.value)}
        />
        {!loading && (
          <span className="hl-result-count">
            <strong>{total.toLocaleString()}</strong> {t('hl.hospitalsFound', { n: '' }).replace('{n} ', '').replace('{n}', '')}
          </span>
        )}
      </div>

      <div className="hl-layout">
        <aside className="hl-sidebar">
          <HospitalFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        <div className="hl-main">
          {error && <ErrorAlert message={error} />}

          {loading ? (
            <LoadingSpinner />
          ) : hospitals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="empty-title">{t('hl.noResults')}</p>
              <p className="empty-subtitle">{t('hl.noResultsHint')}</p>
            </div>
          ) : (
            <>
              <div className="hl-results-bar">
                <span className="hl-results-label">
                  {t('hl.showing', { shown: hospitals.length, total: total.toLocaleString() })}
                </span>
                <span className="hl-page-indicator">{t('hl.page', { page, totalPages })}</span>
              </div>
              <HospitalTable hospitals={hospitals} onDelete={handleDelete} loading={loading} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalList;
