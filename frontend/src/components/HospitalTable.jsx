import React, { useState } from 'react'
import HospitalModal from './HospitalModal'
import './HospitalTable.css'

function HospitalTable({ hospitals, onDelete, loading }) {
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [editingId, setEditingId] = useState(null)

  if (!hospitals || hospitals.length === 0) {
    return null
  }

  const handleEdit = (hospital) => {
    setEditingId(hospital._id)
    setSelectedHospital(hospital)
  }

  const handleViewDetails = (hospital) => {
    setEditingId(null)
    setSelectedHospital(hospital)
  }

  const handleCloseModal = () => {
    setSelectedHospital(null)
    setEditingId(null)
  }

  return (
    <>
      <div className="hospital-table-container">
        <table className="hospital-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Type</th>
              <th>Agency</th>
              <th>Division</th>
              <th>District</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital) => (
              <tr key={hospital._id} className={loading ? 'loading' : ''}>
                <td className="name-cell">
                  <strong>{hospital.name}</strong>
                  {hospital.nameBangla && (
                    <small>{hospital.nameBangla}</small>
                  )}
                </td>
                <td>{hospital.code}</td>
                <td>
                  <span className="badge type-badge">{hospital.type || 'N/A'}</span>
                </td>
                <td>
                  <span className="badge agency-badge">{hospital.agency || 'N/A'}</span>
                </td>
                <td>{hospital.division || 'N/A'}</td>
                <td>{hospital.district || 'N/A'}</td>
                <td className="email-cell">
                  {hospital.email ? (
                    <a href={`mailto:${hospital.email}`}>{hospital.email}</a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  <span className={`status-badge ${hospital.private ? 'private' : 'public'}`}>
                    {hospital.private ? '🔒 Private' : '🔓 Public'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="btn-icon btn-view"
                    onClick={() => handleViewDetails(hospital)}
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(hospital)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(hospital._id)}
                    title="Delete"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedHospital && (
        <HospitalModal
          hospital={selectedHospital}
          isEditing={editingId === selectedHospital._id}
          onClose={handleCloseModal}
          onRefresh={() => {
            handleCloseModal()
          }}
        />
      )}
    </>
  )
}

export default HospitalTable
