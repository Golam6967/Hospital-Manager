import React, { useState } from 'react'
import './Sidebar.css'

const icons = {
  list: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  stats: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  create: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  emergency: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
}

function Sidebar({ activeTab, onTabChange }) {
  const [isOpen, setIsOpen] = useState(true)

  const tabs = [
    { id: 'emergency', label: 'Emergency Search', icon: 'emergency', highlight: true },
    { id: 'list', label: 'Hospital List', icon: 'list' },
    { id: 'stats', label: 'Statistics', icon: 'stats' },
    { id: 'create', label: 'Add Hospital', icon: 'create' },
  ]

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <span className="sidebar-section-label">Navigation</span>
        </div>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.id}>
                {idx === 1 && <li><div className="sidebar-divider" /></li>}
                <li>
                  <button
                    className={`nav-button ${tab.highlight ? 'emergency-nav' : ''} ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => {
                      onTabChange(tab.id)
                      if (window.innerWidth <= 768) {
                        setIsOpen(false)
                      }
                    }}
                  >
                    <span className="nav-icon">{icons[tab.icon]}</span>
                    <span className="nav-label">{tab.label}</span>
                    {activeTab === tab.id && <span className="nav-active-indicator" />}
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="sidebar-version">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
