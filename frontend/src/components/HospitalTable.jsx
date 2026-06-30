import React, { useState } from 'react'
import HospitalModal from './HospitalModal'
import MapPanel from './MapPanel'
import { useLanguage } from '../context/LanguageContext'
import './HospitalTable.css'

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const MapIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
)

function HospitalTable({ hospitals, onDelete, loading }) {
  const { t } = useLanguage()
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [mapHospital, setMapHospital] = useState(null)

  if (!hospitals || hospitals.length === 0) return null

  return (
    <>
      <div className="hospital-table-container">
        <table className="hospital-table">
          <thead>
            <tr>
              <th>{t('table.hospital')}</th>
              <th>{t('table.code')}</th>
              <th>{t('table.type')}</th>
              <th>{t('table.agency')}</th>
              <th>{t('table.division')}</th>
              <th>{t('table.district')}</th>
              <th>{t('table.email')}</th>
              <th>{t('table.status')}</th>
              <th>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map(hospital => (
              <tr key={hospital._id} className={loading ? 'loading' : ''}>
                <td className="name-cell">
                  <strong>{hospital.name}</strong>
                  {hospital.nameBangla && <small>{hospital.nameBangla}</small>}
                </td>
                <td><span className="code-cell">{hospital.code}</span></td>
                <td><span className="badge type-badge">{hospital.type || <span className="na-text">—</span>}</span></td>
                <td><span className="badge agency-badge">{hospital.agency || <span className="na-text">—</span>}</span></td>
                <td>{hospital.division || <span className="na-text">—</span>}</td>
                <td>{hospital.district || <span className="na-text">—</span>}</td>
                <td className="email-cell">
                  {hospital.email ? <a href={`mailto:${hospital.email}`}>{hospital.email}</a> : <span className="na-text">—</span>}
                </td>
                <td>
                  <span className={`status-badge ${hospital.private ? 'private' : 'public'}`}>
                    <span className="status-dot-badge" />
                    {hospital.private ? t('table.private') : t('table.public')}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="btn-icon btn-map" onClick={() => setMapHospital(hospital)} title="Get Directions"><MapIcon /></button>
                  <button className="btn-icon btn-view" onClick={() => { setEditingId(null); setSelectedHospital(hospital) }} title="View Details"><EyeIcon /></button>
                  <button className="btn-icon btn-edit" onClick={() => { setEditingId(hospital._id); setSelectedHospital(hospital) }} title="Edit"><EditIcon /></button>
                  <button className="btn-icon btn-delete" onClick={() => onDelete(hospital._id)} title="Delete" disabled={loading}><TrashIcon /></button>
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
          onClose={() => { setSelectedHospital(null); setEditingId(null) }}
          onRefresh={() => { setSelectedHospital(null); setEditingId(null) }}
        />
      )}

      {mapHospital && <MapPanel hospital={mapHospital} onClose={() => setMapHospital(null)} />}
    </>
  )
}

export default HospitalTable
