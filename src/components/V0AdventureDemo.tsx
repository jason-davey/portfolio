import React, { useState } from 'react'
import { useVoiceflowIntegration, useVoiceflowVisualTrigger } from '../hooks/useVoiceflowIntegration'
import { MobileAppPrototype } from './v0/mobile-app-prototype'
import { V0Integration } from './v0/utils/v0Integration'

// Demo component showing v0.dev integration with adventure portfolio
export const V0AdventureDemo: React.FC = () => {
  const [activeV0Component, setActiveV0Component] = useState<string | null>(null)
  const [componentProps, setComponentProps] = useState<any>({})
  
  const { sendToVoiceflow } = useVoiceflowIntegration()

  // Listen for Voiceflow triggers to show v0 components
  useVoiceflowVisualTrigger('show_mobile_prototype', (props) => {
    setActiveV0Component('MobileAppPrototype')
    setComponentProps(props || {})
  })

  useVoiceflowVisualTrigger('demo_mobile_app', (props) => {
    setActiveV0Component('MobileAppPrototype')
    setComponentProps({ 
      ...props,
      appName: 'TaskFlow Pro',
      interactive: true,
      animated: true
    })
  })

  // Handle interactions from v0 components
  const handleV0Interaction = (action: string, data?: any) => {
    console.log('V0 Component Interaction:', { action, data })
    
    // Send interaction back to Voiceflow
    sendToVoiceflow('v0_component_interaction', {
      component: activeV0Component,
      action,
      data
    })

    // Handle specific actions
    switch (action) {
      case 'request_more_projects':
        sendToVoiceflow('user_wants_more_projects', data)
        break
      case 'screen_changed':
        sendToVoiceflow('prototype_navigation', data)
        break
      case 'feature_explored':
        sendToVoiceflow('feature_interest', data)
        break
    }
  }

  // Create adventure context
  const adventureContext = {
    currentPath: 'build-ship',
    userPreferences: {
      depth: 'deep',
      focus: 'process',
      role: 'peer'
    },
    visitedNodes: ['intro', 'mobile-selection', 'prototype-demo']
  }

  // Create Voiceflow context
  const voiceflowContext = {
    nodeId: 'mobile-prototype-showcase',
    conversationState: {
      userInterest: 'technical_details',
      projectType: 'mobile_app'
    },
    sendToVoiceflow
  }

  // Create props for v0 component
  const v0Props = activeV0Component ? V0Integration.createComponentProps(
    activeV0Component.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
    adventureContext,
    voiceflowContext,
    {
      ...componentProps,
      onInteraction: handleV0Interaction
    }
  ) : {}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            v0.dev + Adventure Portfolio Demo
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            See how v0.dev components integrate with Voiceflow conversations
          </p>
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Demo Controls</h2>
          <p className="text-gray-600 mb-4">
            These buttons simulate Voiceflow triggers that would normally come from conversation flow:
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                setActiveV0Component('MobileAppPrototype')
                setComponentProps({ animated: true })
              }}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              Show Mobile Prototype
            </button>
            
            <button
              onClick={() => {
                setActiveV0Component('MobileAppPrototype')
                setComponentProps({ 
                  appName: 'E-commerce App',
                  screens: ['Home', 'Products', 'Cart', 'Checkout'],
                  features: ['Product search', 'Wishlist', 'One-click buy'],
                  animated: true,
                  interactive: true
                })
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Demo E-commerce App
            </button>
            
            <button
              onClick={() => setActiveV0Component(null)}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Component
            </button>
          </div>
        </div>

        {/* Integration Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              🎯 Adventure Context
            </h3>
            <pre className="text-sm text-blue-800 overflow-x-auto">
              {JSON.stringify(adventureContext, null, 2)}
            </pre>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">
              🤖 Voiceflow Context
            </h3>
            <pre className="text-sm text-purple-800 overflow-x-auto">
              {JSON.stringify(voiceflowContext, null, 2)}
            </pre>
          </div>
        </div>

        {/* Active V0 Component */}
        {activeV0Component && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4">
              <h2 className="text-xl font-semibold">
                Active v0 Component: {activeV0Component}
              </h2>
              <p className="text-indigo-100">
                This component was triggered by Voiceflow and receives adventure context
              </p>
            </div>
            
            <div className="p-6">
              {activeV0Component === 'MobileAppPrototype' && (
                <MobileAppPrototype {...v0Props} />
              )}
            </div>
          </div>
        )}

        {/* No Component State */}
        {!activeV0Component && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No v0 Component Active
            </h2>
            <p className="text-gray-600 mb-6">
              Click one of the demo buttons above to see v0.dev components in action, 
              or trigger them through Voiceflow conversation flows.
            </p>
            <div className="text-sm text-gray-500">
              In the real portfolio, these components would be triggered by natural 
              conversation with the Voiceflow narrator based on user interests.
            </div>
          </div>
        )}

        {/* Workflow Info */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">🔄 v0.dev Integration Workflow</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded">
              <div className="font-semibold text-indigo-600 mb-2">1. Design in v0.dev</div>
              <div className="text-gray-600">
                Create components using natural language prompts in v0.dev
              </div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="font-semibold text-green-600 mb-2">2. Import to Portfolio</div>
              <div className="text-gray-600">
                Use <code>npm run v0:import</code> to add components to your adventure
              </div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="font-semibold text-purple-600 mb-2">3. Voiceflow Integration</div>
              <div className="text-gray-600">
                Components respond to conversation triggers and send interactions back
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default V0AdventureDemo