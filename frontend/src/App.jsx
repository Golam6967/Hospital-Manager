import React, { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import HospitalList from './components/HospitalList'
import Statistics from './components/Statistics'
import CreateHospital from './components/CreateHospital'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('list')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'list':
          return <HospitalList key={refreshTrigger} onRefresh={handleRefresh} />
        case 'stats':
          return <Statistics />
        case 'create':
          return <CreateHospital onSuccess={() => {
            handleRefresh()
            setActiveTab('list')
          }} />
        default:
          return <HospitalList key={refreshTrigger} onRefresh={handleRefresh} />
      }
    } catch (error) {
      console.error('[v0] Error rendering content:', error)
      return <div className="error-container">Error loading content</div>
    }
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Header />
        <div className="app-main">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="app-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
