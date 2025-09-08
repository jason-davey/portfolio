// Development utility for testing Voiceflow integration without full deployment
export class VoiceflowIntegrationTester {
  private messageQueue: any[] = []
  private isTestMode = process.env.NODE_ENV === 'development'
  
  constructor() {
    if (this.isTestMode) {
      this.setupTestInterface()
    }
  }

  // Simulate Voiceflow messages for development testing
  simulateVoiceflowMessage(type: string, payload: any) {
    if (!this.isTestMode) return
    
    const message = {
      type,
      payload,
      timestamp: Date.now(),
      source: 'voiceflow-simulator'
    }
    
    console.log('🤖 Simulating Voiceflow message:', message)
    
    // Dispatch the same events that real Voiceflow integration would
    window.dispatchEvent(new CustomEvent('voiceflow-message', { 
      detail: message 
    }))
  }

  // Test specific conversation flows
  testConversationFlow(flowName: string) {
    const testFlows = {
      'mobile_app_adventure': [
        { type: 'navigate', payload: { nodeId: 'mobile_app', message: 'Let me show you the mobile app journey' }},
        { type: 'visual_trigger', payload: { componentId: 'show_mobile_mockups', props: { animated: true }}},
        { type: 'navigate', payload: { nodeId: 'user_research_phase', message: 'Here\'s how the research unfolded' }}
      ],
      'brand_identity_adventure': [
        { type: 'navigate', payload: { nodeId: 'brand_identity', message: 'Welcome to the brand design story' }},
        { type: 'visual_trigger', payload: { componentId: 'show_brand_evolution', props: { timeline: true }}},
        { type: 'navigate', payload: { nodeId: 'brand_discovery', message: 'Let\'s dive into the discovery process' }}
      ],
      'problem_solving_deep_dive': [
        { type: 'navigate', payload: { nodeId: 'problem_solving', message: 'Let me walk you through my methodology' }},
        { type: 'visual_trigger', payload: { componentId: 'show_process_diagram', props: { interactive: true }}},
        { type: 'navigate', payload: { nodeId: 'user_research_phase', message: 'Research was key to solving this' }}
      ]
    }

    const flow = testFlows[flowName as keyof typeof testFlows]
    if (flow) {
      flow.forEach((step, index) => {
        setTimeout(() => {
          this.simulateVoiceflowMessage(step.type, step.payload)
        }, index * 2000) // 2 second delays between steps
      })
    }
  }

  // Setup development testing interface
  private setupTestInterface() {
    // Add testing panel to development environment
    if (typeof window !== 'undefined') {
      (window as any).voiceflowTester = {
        simulate: this.simulateVoiceflowMessage.bind(this),
        testFlow: this.testConversationFlow.bind(this),
        availableFlows: ['mobile_app_adventure', 'brand_identity_adventure', 'problem_solving_deep_dive']
      }
      
      console.log('🧪 Voiceflow Integration Tester loaded. Try: window.voiceflowTester.testFlow("mobile_app_adventure")')
    }
  }

  // Validation helpers
  validateIntegrationPoints() {
    const requiredElements = [
      'adventure-entry',
      'pathway-cards',
      'story-container'
    ]
    
    const missing = requiredElements.filter(id => !document.querySelector(`[data-testid="${id}"]`))
    
    if (missing.length > 0) {
      console.warn('⚠️ Missing integration elements:', missing)
      return false
    }
    
    console.log('✅ All integration points ready')
    return true
  }
}

// Auto-initialize in development
export const integrationTester = new VoiceflowIntegrationTester()