import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import './Header.css'

const ROLE_COLORS = {
  ADMIN:   { bg: 'rgba(220,38,38,0.18)',  text: '#fca5a5' },
  MANAGER: { bg: 'rgba(217,119,6,0.18)',  text: '#fcd34d' },
  DOCTOR:  { bg: 'rgba(34,197,94,0.18)',  text: '#86efac' },
  STAFF:   { bg: 'rgba(99,102,241,0.18)', text: '#c7d2fe' },
  USER:    { bg: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.7)' },
}

function LangToggle() {
  const { lang, toggleLang } = useLanguage()
  return (
    <button className="header-toggle lang-toggle" onClick={toggleLang} title="Switch language / ভাষা পরিবর্তন">
      <span className={lang === 'en' ? 'toggle-active' : 'toggle-dim'}>EN</span>
      <span className="toggle-sep">|</span>
      <span className={lang === 'bn' ? 'toggle-active' : 'toggle-dim'}>বাং</span>
    </button>
  )
}

function BwToggle() {
  const { bwMode, toggleBw } = useTheme()
  return (
    <button className={`header-toggle bw-toggle ${bwMode ? 'bw-on' : ''}`} onClick={toggleBw} title={bwMode ? 'Switch to colour mode' : 'Switch to B&W mode'}>
      {bwMode ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2a10 10 0 0 1 0 20V2z" fill="currentColor" stroke="none"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )}
      <span>{bwMode ? 'Colour' : 'B&W'}</span>
    </button>
  )
}

function UserMenu({ user }) {
  const { logout } = useAuth()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try { await logout() } finally { setLoggingOut(false) }
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const roleStyle = ROLE_COLORS[user.role] || ROLE_COLORS.USER

  return (
    <div className="user-menu" ref={ref}>
      <button className="user-menu-trigger" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name-row">
            <span className="status-dot"></span>
            <span className="user-name">{user.firstName} {user.lastName}</span>
          </div>
          <span className="user-role-badge" style={{ background: roleStyle.bg, color: roleStyle.text }}>
            {user.role}
          </span>
        </div>
        <svg className={`user-chevron ${open ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className="user-dropdown-avatar">{initials}</div>
            <div>
              <div className="user-dropdown-name">{user.firstName} {user.lastName}</div>
              <div className="user-dropdown-email">{user.email}</div>
            </div>
          </div>
          <div className="user-dropdown-divider" />
          <button className="user-dropdown-logout" onClick={handleLogout} disabled={loggingOut}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {loggingOut ? t('signingOut') : t('signOut')}
          </button>
        </div>
      )}
    </div>
  )
}

function Header({ activeTab, onTabChange, user }) {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef(null)
  const inputRef = useRef(null)

  const NAV_TABS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      id: 'emergency',
      label: t('nav.emergency'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
    },
    {
      id: 'list',
      label: t('nav.list'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
      ),
    },
    {
      id: 'stats',
      label: t('nav.stats'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
      ),
    },
    {
      id: 'create',
      label: t('nav.create'),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
    },
  ]

  const filteredTabs = NAV_TABS.filter(tab =>
    tab.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavSelect = (id) => {
    onTabChange(id)
    setSearchOpen(false)
    setSearchQuery('')
    inputRef.current?.blur()
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchQuery('')
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && filteredTabs.length > 0) {
      handleNavSelect(filteredTabs[0].id)
    }
  }

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">
          <div className="header-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="rgba(255,255,255,0.15)"/>
              <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z" fill="white"/>
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div className="header-text">
            <h1 className="header-title">{t('appTitle')}</h1>
            <p className="header-subtitle">{t('appSubtitle')}</p>
          </div>
        </div>

        <div className="header-right">
          <div className="nav-search" ref={searchRef}>
            <div className="nav-search-input-wrap">
              <svg className="nav-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                className="nav-search-input"
                placeholder={t('searchPages')}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
              />
              {searchQuery && <span className="nav-search-kbd">↵</span>}
            </div>
            {searchOpen && filteredTabs.length > 0 && (
              <div className="nav-search-dropdown">
                {filteredTabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`nav-search-item ${activeTab === tab.id ? 'current' : ''} ${tab.id === 'emergency' ? 'emergency' : ''}`}
                    onClick={() => handleNavSelect(tab.id)}
                  >
                    <span className="nav-search-item-icon">{tab.icon}</span>
                    <span className="nav-search-item-label">{tab.label}</span>
                    {activeTab === tab.id && <span className="nav-search-item-badge">current</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="header-sep" />
          <LangToggle />
          <BwToggle />
          <div className="header-sep" />
          {user && <UserMenu user={user} />}
        </div>
      </div>

      <div className="header-breadcrumb">
        <button
          className="breadcrumb-home"
          onClick={() => onTabChange('dashboard')}
          title="Go to Dashboard"
          aria-label="Home"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Home</span>
        </button>
        {activeTab !== 'dashboard' && (
          <>
            <span className="breadcrumb-sep">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
            <span className={`breadcrumb-current ${activeTab === 'emergency' ? 'bc-emergency' : ''}`}>
              {NAV_TABS.find(t => t.id === activeTab)?.label ?? activeTab}
            </span>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
