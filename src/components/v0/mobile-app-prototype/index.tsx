import React, { useState } from 'react'
import { V0ComponentProps } from '../types'

// Generated from v0.dev
// Original prompt: Create an interactive mobile app prototype showcase for a design portfolio
// Adventure paths: build-ship
// Voiceflow triggers: show_mobile_prototype, demo_mobile_app

interface MobileAppPrototypeProps extends V0ComponentProps {
  appName?: string
  screens?: string[]
  features?: string[]
}

export const MobileAppPrototype: React.FC<MobileAppPrototypeProps> = ({
  animated = true,
  theme = 'auto',
  size = 'md',
  interactive = true,
  onInteraction,
  adventureContext,
  voiceflowContext,
  appName = "TaskFlow",
  screens = ["Login", "Dashboard", "Task List", "Profile"],
  features = ["Real-time sync", "Offline mode", "Team collaboration"],
  ...props
}) => {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleScreenChange = (screenIndex: number) => {
    if (!interactive) return
    
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentScreen(screenIndex)
      setIsAnimating(false)
      
      // Notify Voiceflow of interaction
      onInteraction?.('screen_changed', {
        screenName: screens[screenIndex],
        screenIndex,
        appName
      })
    }, animated ? 300 : 0)
  }

  const handleFeatureClick = (feature: string) => {
    onInteraction?.('feature_explored', {
      feature,
      appName,
      currentScreen: screens[currentScreen]
    })
  }

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">{appName} Mobile App</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive prototype showcasing key user flows
        </p>
      </div>

      {/* Mobile Frame */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Phone Mockup */}
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <div className="relative">
            {/* Phone Frame */}
            <div className="w-80 h-[640px] bg-gray-800 rounded-[3rem] p-4 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status Bar */}
                <div className="h-6 bg-gray-100 flex items-center justify-between px-6 text-xs">
                  <span>9:41</span>
                  <span>●●●●●</span>
                </div>
                
                {/* Screen Content */}
                <div className={`h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-6 transition-all duration-300 ${
                  isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-2xl">📱</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {screens[currentScreen]}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      {currentScreen === 0 && "Welcome back! Sign in to continue"}
                      {currentScreen === 1 && "Your productivity dashboard"}
                      {currentScreen === 2 && "Manage your tasks efficiently"}
                      {currentScreen === 3 && "Customize your profile"}
                    </p>
                    
                    {/* Mock UI Elements */}
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="h-12 bg-white rounded-lg shadow-sm border border-gray-200"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Info */}
        <div className="flex-1 space-y-6">
          {/* Screen Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Navigate Screens</h3>
            <div className="grid grid-cols-2 gap-2">
              {screens.map((screen, index) => (
                <button
                  key={screen}
                  onClick={() => handleScreenChange(index)}
                  disabled={!interactive}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    currentScreen === index
                      ? 'bg-indigo-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!interactive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {screen}
                </button>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <button
                  key={feature}
                  onClick={() => handleFeatureClick(feature)}
                  disabled={!interactive}
                  className={`w-full p-3 text-left rounded-lg border transition-all ${
                    interactive 
                      ? 'hover:bg-indigo-50 hover:border-indigo-200 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-indigo-500 mr-3">✓</span>
                    <span className="font-medium">{feature}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Adventure Context Info */}
          {adventureContext && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Adventure Context</h4>
              <p className="text-blue-700 text-sm">
                Path: {adventureContext.currentPath} | 
                Focus: {adventureContext.userPreferences?.focus}
              </p>
            </div>
          )}

          {/* Call to Action */}
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
            <h4 className="font-semibold mb-2">Want to see more?</h4>
            <p className="text-sm mb-3">
              This is just one example of the mobile apps I've designed and built.
            </p>
            <button
              onClick={() => onInteraction?.('request_more_projects', { appName, currentScreen: screens[currentScreen] })}
              disabled={!interactive}
              className={`px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm transition-all ${
                interactive ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Explore More Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileAppPrototype

// Component metadata for registration
export const MobileAppPrototypeMetadata = {
  id: 'mobile-app-prototype',
  name: 'MobileAppPrototype',
  description: 'Interactive mobile app prototype showcase for design portfolio',
  adventurePaths: ['build-ship'],
  voiceflowTriggers: ['show_mobile_prototype', 'demo_mobile_app'],
  v0Url: '',
  metadata: {
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    designPrompt: 'Create an interactive mobile app prototype showcase for a design portfolio',
    v0Url: ''
  }
}

// Auto-register component when imported
import { V0Integration } from '../utils/v0Integration'
V0Integration.registerComponent(MobileAppPrototypeMetadata)