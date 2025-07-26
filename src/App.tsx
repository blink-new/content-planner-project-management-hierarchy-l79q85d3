import React, { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { AppSidebar } from './components/layout/AppSidebar'
import { Dashboard } from './components/pages/Dashboard'
import { Calendar } from './components/pages/Calendar'
import { Projects } from './components/pages/Projects'
import { Team } from './components/pages/Team'
import { Settings } from './components/pages/Settings'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <Calendar />
      case 'projects':
        return <Projects />
      case 'team':
        return <Team />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">ContentFlow</h2>
          <p className="text-muted-foreground">Загрузка приложения...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-primary-foreground font-bold text-2xl">CF</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">ContentFlow</h1>
          <p className="text-muted-foreground mb-6">
            Планировщик контента и система управления проектами с иерархией прав
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Войти в систему
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Боковая панель */}
      <div className="w-80 flex-shrink-0">
        <AppSidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
        />
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  )
}

export default App