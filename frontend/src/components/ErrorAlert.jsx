import React, { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import './ErrorAlert.css'

function ErrorAlert({ message, onRetry }) {
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="error-alert">
      <div className="alert-icon-wrap">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div className="alert-content">
        <h4>{t('error.title')}</h4>
        <p>{message}</p>
      </div>
      <div className="alert-actions">
        {onRetry && (
          <button className="alert-btn alert-btn-retry" onClick={onRetry}>{t('error.retry')}</button>
        )}
        <button className="alert-btn alert-btn-dismiss" onClick={() => setDismissed(true)}>{t('error.dismiss')}</button>
      </div>
    </div>
  )
}

export default ErrorAlert
