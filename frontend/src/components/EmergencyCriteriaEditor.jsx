import React from 'react'
import './EmergencyCriteriaEditor.css'

export const SPECIALTY_IDS = [
  'cut','neurological','bone','cardiac','respiratory','burn',
  'maternity','paediatric','poisoning','cancer','trauma','other',
]

export const SPECIALTY_META = {
  cut:          { label: 'Wound / Cut',       icon: '🩹' },
  neurological: { label: 'Neurological',      icon: '🧠' },
  bone:         { label: 'Bone / Fracture',   icon: '🦴' },
  cardiac:      { label: 'Cardiac',           icon: '❤️' },
  respiratory:  { label: 'Respiratory',       icon: '🫁' },
  burn:         { label: 'Burns',             icon: '🔥' },
  maternity:    { label: 'Maternity',         icon: '🤰' },
  paediatric:   { label: 'Paediatric',        icon: '👶' },
  poisoning:    { label: 'Poisoning',         icon: '☠️' },
  cancer:       { label: 'Cancer / Oncology', icon: '🎗️' },
  trauma:       { label: 'Trauma / Accident', icon: '🚑' },
  other:        { label: 'Other Emergency',   icon: '⚕️' },
}

function scoreColor(s) {
  if (s >= 80) return '#16a34a'
  if (s >= 60) return '#d97706'
  return '#dc2626'
}

/**
 * criteria: { cardiac: 85, burn: 60, ... }
 * onChange: (newCriteria) => void
 */
function EmergencyCriteriaEditor({ criteria = {}, onChange }) {
  const toggle = (id) => {
    const next = { ...criteria }
    if (id in next) {
      delete next[id]
    } else {
      next[id] = 50
    }
    onChange(next)
  }

  const setScore = (id, val) => {
    onChange({ ...criteria, [id]: Number(val) })
  }

  const enabledCount = Object.keys(criteria).length

  return (
    <div className="ece-root">
      <div className="ece-hint">
        Click a card to enable that emergency type for this hospital, then set its score (0 = won&apos;t appear, 100 = top-ranked).
        {enabledCount > 0 && (
          <span className="ece-count">{enabledCount} active</span>
        )}
      </div>

      <div className="ece-grid">
        {SPECIALTY_IDS.map(id => {
          const { label, icon } = SPECIALTY_META[id]
          const enabled = id in criteria
          const score   = criteria[id] ?? 50
          const color   = scoreColor(score)

          return (
            <div
              key={id}
              className={`ece-card ${enabled ? 'ece-card--on' : ''}`}
              style={enabled ? { '--ece-accent': color } : {}}
            >
              <button
                type="button"
                className="ece-toggle-row"
                onClick={() => toggle(id)}
                aria-pressed={enabled}
              >
                <span className="ece-icon">{icon}</span>
                <span className="ece-label">{label}</span>
                <span className={`ece-toggle ${enabled ? 'ece-toggle--on' : ''}`}>
                  <span className="ece-toggle-knob" />
                </span>
              </button>

              {enabled && (
                <div className="ece-score-row">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={score}
                    onChange={e => setScore(id, e.target.value)}
                    className="ece-slider"
                    style={{
                      '--ece-fill': color,
                      background: `linear-gradient(to right, ${color} 0%, ${color} ${score}%, var(--border-strong) ${score}%, var(--border-strong) 100%)`,
                    }}
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="ece-score-val" style={{ color }}>{score}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default EmergencyCriteriaEditor
