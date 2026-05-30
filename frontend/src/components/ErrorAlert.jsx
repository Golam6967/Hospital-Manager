import React, { useState } from 'react'
import './ErrorAlert.css'

function ErrorAlert({ message, onRetry }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) {
    return null
  }

  return (
    <div className="error-alert">
      <div className="alert-icon">⚠️</div>
      <div className="alert-content">
        <h4>Error</h4>
        <p>{message}</p>
      </div>
      <div className="alert-actions">
        {onRetry && (
          <button className="alert-btn alert-btn-retry" onClick={onRetry}>
            Retry
          </button>
        )}
        <button
          className="alert-btn alert-btn-dismiss"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default ErrorAlert
