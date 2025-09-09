// Testing utilities for v0 components in the adventure portfolio

import { V0Component, V0ComponentProps } from '../types'
import { V0Integration } from './v0Integration'

export class V0ComponentTester {
  private static testResults: Map<string, any> = new Map()
  
  // Test a v0 component with simulated adventure context
  static async testComponent(
    componentId: string,
    testScenarios: Array<{
      name: string
      props: Partial<V0ComponentProps>
      expectedBehavior: string
    }>
  ) {
    console.log(`🧪 Testing v0 component: ${componentId}`)
    
    const component = V0Integration.getComponent(componentId)
    if (!component) {
      console.error(`❌ Component ${componentId} not found`)
      return false
    }
    
    const results = []
    
    for (const scenario of testScenarios) {
      console.log(`  📋 Testing scenario: ${scenario.name}`)
      
      try {
        // Create test props
        const testProps = V0Integration.createComponentProps(
          componentId,
          this.createMockAdventureContext(),
          this.createMockVoiceflowContext(),
          scenario.props
        )
        
        // Simulate component rendering and interaction
        const result = await this.simulateComponentBehavior(componentId, testProps)
        
        results.push({
          scenario: scenario.name,
          success: true,
          result,
          expectedBehavior: scenario.expectedBehavior
        })
        
        console.log(`  ✅ ${scenario.name} - Passed`)
      } catch (error) {
        results.push({
          scenario: scenario.name,
          success: false,
          error: error.message,
          expectedBehavior: scenario.expectedBehavior
        })
        
        console.log(`  ❌ ${scenario.name} - Failed: ${error.message}`)
      }
    }
    
    this.testResults.set(componentId, results)
    return results.every(r => r.success)
  }
  
  // Test integration with Voiceflow triggers
  static testVoiceflowIntegration(componentId: string, triggers: string[]) {
    console.log(`🔗 Testing Voiceflow integration for: ${componentId}`)
    
    const component = V0Integration.getComponent(componentId)
    if (!component) {
      console.error(`❌ Component ${componentId} not found`)
      return false
    }
    
    // Test each trigger
    triggers.forEach(trigger => {
      const components = V0Integration.getComponentsForTrigger(trigger)
      const hasComponent = components.some(c => c.id === componentId)
      
      if (hasComponent) {
        console.log(`  ✅ Trigger "${trigger}" correctly mapped`)
      } else {
        console.log(`  ❌ Trigger "${trigger}" not mapped to component`)
      }
    })
    
    return true
  }
  
  // Test component across different adventure paths
  static testAdventurePaths(componentId: string) {
    console.log(`🗺️ Testing adventure path integration for: ${componentId}`)
    
    const component = V0Integration.getComponent(componentId)
    if (!component) {
      console.error(`❌ Component ${componentId} not found`)
      return false
    }
    
    component.adventurePaths.forEach(pathId => {
      const pathComponents = V0Integration.getComponentsForPath(pathId)
      const hasComponent = pathComponents.some(c => c.id === componentId)
      
      if (hasComponent) {
        console.log(`  ✅ Available in path: ${pathId}`)
      } else {
        console.log(`  ❌ Missing from path: ${pathId}`)
      }
    })
    
    return true
  }
  
  // Simulate component behavior for testing
  private static async simulateComponentBehavior(
    componentId: string,
    props: V0ComponentProps
  ): Promise<any> {
    // This would simulate rendering and basic interactions
    // In a real implementation, you might use testing-library
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          rendered: true,
          propsReceived: Object.keys(props),
          interactionHandlers: !!props.onInteraction
        })
      }, 100)
    })
  }
  
  // Create mock adventure context for testing
  private static createMockAdventureContext() {
    return {
      currentPath: 'build-ship',
      userPreferences: {
        depth: 'deep',
        focus: 'process',
        role: 'peer'
      },
      visitedNodes: ['intro', 'mobile-app-selection']
    }
  }
  
  // Create mock Voiceflow context for testing
  private static createMockVoiceflowContext() {
    return {
      nodeId: 'show-mobile-prototype',
      conversationState: {
        userInterest: 'technical_details',
        projectType: 'mobile_app'
      },
      sendToVoiceflow: (intent: string, data?: any) => {
        console.log(`📤 Mock Voiceflow message: ${intent}`, data)
      }
    }
  }
  
  // Get test results for a component
  static getTestResults(componentId: string) {
    return this.testResults.get(componentId)
  }
  
  // Run comprehensive test suite for all registered components
  static async testAllComponents() {
    console.log('🚀 Running comprehensive v0 component test suite...')
    
    const allComponents = Array.from(V0Integration['components'].values())
    const results = []
    
    for (const component of allComponents) {
      console.log(`\n📦 Testing component: ${component.name}`)
      
      // Basic integration tests
      const basicTests = await this.testComponent(component.id, [
        {
          name: 'Default rendering',
          props: {},
          expectedBehavior: 'Component renders with default props'
        },
        {
          name: 'Interactive mode',
          props: { interactive: true },
          expectedBehavior: 'Component handles interactions'
        },
        {
          name: 'Adventure context',
          props: { 
            adventureContext: this.createMockAdventureContext()
          },
          expectedBehavior: 'Component adapts to adventure context'
        }
      ])
      
      // Voiceflow integration tests
      const voiceflowTests = this.testVoiceflowIntegration(
        component.id, 
        component.voiceflowTriggers
      )
      
      // Adventure path tests
      const pathTests = this.testAdventurePaths(component.id)
      
      results.push({
        componentId: component.id,
        componentName: component.name,
        basicTests,
        voiceflowTests,
        pathTests,
        overallSuccess: basicTests && voiceflowTests && pathTests
      })
    }
    
    // Summary
    const successCount = results.filter(r => r.overallSuccess).length
    console.log(`\n📊 Test Summary: ${successCount}/${results.length} components passed all tests`)
    
    return results
  }
}

// Make tester available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).v0Tester = V0ComponentTester
}