import React, { useState } from 'react'
import { Portfolio } from './components/Portfolio'
import { AdventureEntryPoint } from './components/AdventureEntryPoint'
import { V0AdventureDemo } from './components/V0AdventureDemo'

const sampleProjects = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Full-stack web application with Supabase backend',
    technologies: ['React', 'TypeScript', 'Supabase'],
    featured: true
  },
  {
    id: '2',
    title: 'Mobile Weather App',
    description: 'React Native app with real-time weather data',
    technologies: ['React Native', 'JavaScript', 'API'],
    featured: false
  },
  {
    id: '3',
    title: 'AI Chatbot',
    description: 'Voiceflow-powered customer service bot',
    technologies: ['Voiceflow', 'JavaScript', 'AI'],
    featured: true
  }
]

type ViewMode = 'adventure' | 'v0-demo' | 'legacy'

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('adventure')

  // Check if v0 integration is enabled
  const isV0Enabled = import.meta.env.VITE_V0_INTEGRATION === 'true'

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              Interactive Design Portfolio
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('adventure')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'adventure'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Adventure Mode
              </button>
              {isV0Enabled && (
                <button
                  onClick={() => setCurrentView('v0-demo')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'v0-demo'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  v0.dev Demo
                </button>
              )}
              <button
                onClick={() => setCurrentView('legacy')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'legacy'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Legacy View
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>
        {currentView === 'adventure' && <AdventureEntryPoint />}
        {currentView === 'v0-demo' && isV0Enabled && <V0AdventureDemo />}
        {currentView === 'legacy' && <Portfolio projects={sampleProjects} />}
        
        {/* Fallback if v0 not enabled */}
        {currentView === 'v0-demo' && !isV0Enabled && (
          <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-yellow-800 mb-4">
                v0.dev Integration Not Enabled
              </h2>
              <p className="text-yellow-700 mb-6">
                To see the v0.dev demo, start the development server with v0 integration:
              </p>
              <code className="bg-yellow-100 px-4 py-2 rounded text-yellow-800">
                npm run dev:v0
              </code>
              <p className="text-yellow-600 text-sm mt-4">
                Or use the full integration mode: <code>npm run dev:full</code>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>
            Built with collaborative AI: Voiceflow + Claude Code + v0.dev
          </p>
          {isV0Enabled && (
            <p className="text-sm mt-2 text-purple-600">
              v0.dev integration active ✨
            </p>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App