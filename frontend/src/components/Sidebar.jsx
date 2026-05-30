import React, { useState } from 'react'
import './Sidebar.css'

function Sidebar({ activeTab, onTabChange }) {
  const [isOpen, setIsOpen] = useState(true)

  const tabs = [
    { id: 'list', label: '📋 Hospital List', icon: 'list' },
    { id: 'stats', label: '📊 Statistics', icon: 'stats' },
    { id: 'create', label: '➕ Add Hospital', icon: 'create' },
  ]

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    onTabChange(tab.id)
                    if (window.innerWidth <= 768) {
                      setIsOpen(false)
                    }
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p className="sidebar-version">v1.0.0</p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
