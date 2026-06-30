import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [bwMode, setBwMode] = useState(() => localStorage.getItem('bwMode') === 'true')

  useEffect(() => {
    localStorage.setItem('bwMode', bwMode)
    if (bwMode) {
      document.documentElement.setAttribute('data-theme', 'bw')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [bwMode])

  const toggleBw = useCallback(() => setBwMode(prev => !prev), [])

  return (
    <ThemeContext.Provider value={{ bwMode, toggleBw }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
