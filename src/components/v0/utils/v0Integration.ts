import { V0Component, V0ComponentProps } from '../types'

// Helper functions for integrating v0 components with the adventure portfolio

export class V0Integration {
  private static components: Map<string, V0Component> = new Map()
  
  // Register a v0 component for use in adventures
  static registerComponent(component: V0Component) {
    this.components.set(component.id, component)
    console.log(`Registered v0 component: ${component.name}`)
  }
  
  // Get component by ID
  static getComponent(id: string): V0Component | undefined {
    return this.components.get(id)
  }
  
  // Get components for a specific adventure path
  static getComponentsForPath(pathId: string): V0Component[] {
    return Array.from(this.components.values()).filter(
      component => component.adventurePaths.includes(pathId)
    )
  }
  
  // Get components that respond to a Voiceflow trigger
  static getComponentsForTrigger(trigger: string): V0Component[] {
    return Array.from(this.components.values()).filter(
      component => component.voiceflowTriggers.includes(trigger)
    )
  }
  
  // Create props for a v0 component based on adventure context
  static createComponentProps(
    componentId: string,
    adventureContext: any,
    voiceflowContext: any,
    customProps: any = {}
  ): V0ComponentProps {
    return {
      animated: true,
      theme: 'auto',
      size: 'md',
      interactive: true,
      adventureContext,
      voiceflowContext,
      onInteraction: (action: string, data?: any) => {
        // Send interaction back to Voiceflow
        voiceflowContext?.sendToVoiceflow?.('component_interaction', {
          componentId,
          action,
          data
        })
        
        // Track analytics
        this.trackInteraction(componentId, action, data)
      },
      ...customProps
    }
  }
  
  // Track component interactions for analytics
  private static trackInteraction(componentId: string, action: string, data?: any) {
    // This could integrate with your analytics system
    console.log('V0 Component Interaction:', { componentId, action, data })
    
    // Could also update user journey tracking
    window.dispatchEvent(new CustomEvent('v0-component-interaction', {
      detail: { componentId, action, data, timestamp: Date.now() }
    }))
  }
  
  // Generate a component template for new v0 imports
  static generateComponentTemplate(
    componentName: string,
    v0Code: string,
    metadata: {
      designPrompt?: string
      v0Url?: string
      adventurePaths?: string[]
      voiceflowTriggers?: string[]
    }
  ): string {
    const componentId = componentName.toLowerCase().replace(/\s+/g, '-')
    
    return `import React from 'react'
import { V0ComponentProps } from '../types'

// Generated from v0.dev
// Original prompt: ${metadata.designPrompt || 'Not provided'}
// v0.dev URL: ${metadata.v0Url || 'Not provided'}

interface ${componentName}Props extends V0ComponentProps {
  // Add component-specific props here
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  animated = true,
  theme = 'auto',
  size = 'md',
  interactive = true,
  onInteraction,
  adventureContext,
  voiceflowContext,
  ...props
}) => {
  // Handle interactions with Voiceflow
  const handleInteraction = (action: string, data?: any) => {
    onInteraction?.(action, data)
  }

  ${v0Code}
}

export default ${componentName}

// Component metadata for registration
export const ${componentName}Metadata = {
  id: '${componentId}',
  name: '${componentName}',
  description: 'Generated from v0.dev',
  adventurePaths: ${JSON.stringify(metadata.adventurePaths || [])},
  voiceflowTriggers: ${JSON.stringify(metadata.voiceflowTriggers || [])},
  metadata: {
    createdAt: '${new Date().toISOString()}',
    lastUpdated: '${new Date().toISOString()}',
    designPrompt: '${metadata.designPrompt || ''}',
    v0Url: '${metadata.v0Url || ''}'
  }
}`
  }
}

// Hook for using v0 components in adventure paths
export const useV0Component = (componentId: string) => {
  const component = V0Integration.getComponent(componentId)
  
  return {
    component,
    isRegistered: !!component,
    createProps: (adventureContext: any, voiceflowContext: any, customProps: any = {}) =>
      V0Integration.createComponentProps(componentId, adventureContext, voiceflowContext, customProps)
  }
}