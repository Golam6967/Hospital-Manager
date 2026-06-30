import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import AuthPage from './components/auth/AuthPage'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import HospitalList from './components/HospitalList'
import Statistics from './components/Statistics'
import CreateHospital from './components/CreateHospital'
import EmergencySearch from './components/EmergencySearch'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

function AppShell() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1)

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard': return <Dashboard user={user} onNavigate={setActiveTab} />
        case 'list':      return <HospitalList key={refreshTrigger} onRefresh={handleRefresh} />
        case 'stats':     return <Statistics />
        case 'create':    return <CreateHospital onSuccess={() => { handleRefresh(); setActiveTab('list') }} />
        case 'emergency': return <EmergencySearch />
        default:          return <Dashboard user={user} onNavigate={setActiveTab} />
      }
    } catch (error) {
      return <div className="error-container">Error loading content</div>
    }
  }

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={setActiveTab} user={user} />
      <main className="app-content">
        {renderContent()}
      </main>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
