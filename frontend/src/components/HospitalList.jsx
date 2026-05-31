import React, { useState, useEffect } from "react";
import apiService from "../services/api";
import HospitalFilters from "./HospitalFilters";
import HospitalTable from "./HospitalTable";
import Pagination from "./Pagination";
import ErrorAlert from "./ErrorAlert";
import LoadingSpinner from "./LoadingSpinner";
import "./HospitalList.css";

function HospitalList({ onRefresh }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    division: "",
    district: "",
    upazila: "",
    type: "",
    agency: "",
    private: "",
    name: "",
  });
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, limit, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (hasActiveFilters) {
        data = await apiService.filterHospitals(filters, page, limit);
      } else {
        data = await apiService.getAllHospitals(page, limit);
      }

      setHospitals(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setPage(data.page || 1);
    } catch (err) {
      console.error("[v0] Error fetching hospitals:", err);
      setError(
        err.message ||
          "Failed to fetch hospitals. Please check if the API server is running.",
      );
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    console.log(newFilters);
    setFilters(newFilters);

    const hasFilters = Object.values(newFilters).some(
      (val) => val !== undefined && val !== null && val !== "",
    );
    setHasActiveFilters(hasFilters);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hospital?")) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteHospital(id);
      setError(null);
      fetchData();
      onRefresh?.();
    } catch (err) {
      console.error("[v0] Error deleting hospital:", err);
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
        <h2>Hospital List</h2>
        <ErrorAlert message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="hospital-list">
      <div className="hospital-list-header">
        <h2>Hospital List</h2>
        <div className="list-stats">
          <span>
            Total: <strong>{total}</strong>
          </span>
          <span>
            Page:{" "}
            <strong>
              {page} of {totalPages}
            </strong>
          </span>
        </div>
      </div>

      <HospitalFilters onFilterChange={handleFilterChange} />

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : hospitals.length === 0 ? (
        <div className="empty-state">
          <p>No hospitals found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <HospitalTable
            hospitals={hospitals}
            onDelete={handleDelete}
            loading={loading}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default HospitalList;
