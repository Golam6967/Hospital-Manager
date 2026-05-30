import React from 'react'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">🏥 Hospital Manager</h1>
          <p className="header-subtitle">Comprehensive Hospital Management System</p>
        </div>
        <div className="header-right">
          <p className="api-status">API: http://localhost:5000</p>
        </div>
      </div>
    </header>
  )
}

export default Header
