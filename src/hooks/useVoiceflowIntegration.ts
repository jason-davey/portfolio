import { useState, useEffect, useCallback } from 'react'
import { voiceflowToReactMapping, VoiceflowNode } from '../data/voiceflowMapping'

interface VoiceflowMessage {
  type: 'navigate' | 'visual_trigger' | 'preference_update' | 'completion'
  payload: any
  timestamp: number
}

interface VoiceflowIntegration {
  currentNode: VoiceflowNode | null
  isVoiceflowActive: boolean
  handleVoiceflowMessage: (message: VoiceflowMessage) => void
  triggerVisualComponent: (componentId: string, props?: any) => void
  sendToVoiceflow: (intent: string, data?: any) => void
}

export const useVoiceflowIntegration = (): VoiceflowIntegration => {
  const [currentNode, setCurrentNode] = useState<VoiceflowNode | null>(null)
  const [isVoiceflowActive, setIsVoiceflowActive] = useState(false)

  // Listen for messages from Voiceflow
  const handleVoiceflowMessage = useCallback((message: VoiceflowMessage) => {
    console.log('Received Voiceflow message:', message)

    switch (message.type) {
      case 'navigate':
        const targetNode = voiceflowToReactMapping.find(node => 
          node.id === message.payload.nodeId
        )
        if (targetNode) {
          setCurrentNode(targetNode)
          
          // Trigger any associated visual effects
          if (targetNode.visualTriggers) {
            targetNode.visualTriggers.forEach(trigger => {
              triggerVisualComponent(trigger, message.payload.props)
            })
          }
        }
        break

      case 'visual_trigger':
        triggerVisualComponent(message.payload.componentId, message.payload.props)
        break

      case 'completion':
        // Handle journey completion
        setIsVoiceflowActive(false)
        // Could trigger recommendation engine, analytics, etc.
        break
    }
  }, [])

  // Trigger visual components based on Voiceflow instructions
  const triggerVisualComponent = useCallback((componentId: string, props?: any) => {
    // Dispatch custom events that React components can listen to
    window.dispatchEvent(new CustomEvent('voiceflow-visual-trigger', {
      detail: { componentId, props }
    }))
  }, [])

  // Send data back to Voiceflow
  const sendToVoiceflow = useCallback((intent: string, data?: any) => {
    // This would integrate with Voiceflow's API or widget
    // For now, we'll simulate the communication
    console.log('Sending to Voiceflow:', { intent, data })
    
    // Example: User clicked on a project card
    if (intent === 'project_selected') {
      // Voiceflow could respond with contextual information about that project
    }
    
    // Example: User wants to go deeper
    if (intent === 'request_deep_dive') {
      // Voiceflow could guide them to detailed case study
    }
  }, [])

  // Initialize Voiceflow connection
  useEffect(() => {
    // Set up Voiceflow widget or API connection
    // This is where you'd integrate with the actual Voiceflow runtime
    
    const initVoiceflow = async () => {
      try {
        // Initialize Voiceflow widget with your project ID
        // window.voiceflow = new VoiceflowWidget({ projectId: 'your-project-id' })
        
        setIsVoiceflowActive(true)
        
        // Set up message listener
        // window.addEventListener('voiceflow-message', handleVoiceflowMessage)
      } catch (error) {
        console.error('Failed to initialize Voiceflow:', error)
      }
    }

    initVoiceflow()

    return () => {
      // Cleanup
      // window.removeEventListener('voiceflow-message', handleVoiceflowMessage)
    }
  }, [handleVoiceflowMessage])

  return {
    currentNode,
    isVoiceflowActive,
    handleVoiceflowMessage,
    triggerVisualComponent,
    sendToVoiceflow
  }
}

// Custom hook for React components to listen to Voiceflow triggers
export const useVoiceflowVisualTrigger = (componentId: string, callback: (props: any) => void) => {
  useEffect(() => {
    const handleTrigger = (event: CustomEvent) => {
      if (event.detail.componentId === componentId) {
        callback(event.detail.props)
      }
    }

    window.addEventListener('voiceflow-visual-trigger', handleTrigger as EventListener)

    return () => {
      window.removeEventListener('voiceflow-visual-trigger', handleTrigger as EventListener)
    }
  }, [componentId, callback])
}