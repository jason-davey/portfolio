// Shared types for v0.dev components integration

export interface V0Component {
  id: string
  name: string
  description: string
  v0Url?: string // Link back to v0.dev for iterations
  adventurePaths: string[] // Which paths this component belongs to
  voiceflowTriggers: string[] // Voiceflow events that show this component
  props?: Record<string, any>
  metadata: {
    createdAt: string
    v0Version?: string
    lastUpdated: string
    designPrompt?: string // Original v0 prompt for reference
  }
}

export interface V0ComponentProps {
  // Common props that all v0 components might receive
  animated?: boolean
  theme?: 'light' | 'dark' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  onInteraction?: (action: string, data?: any) => void
  
  // Adventure-specific props
  adventureContext?: {
    currentPath: string
    userPreferences: any
    visitedNodes: string[]
  }
  
  // Voiceflow integration props
  voiceflowContext?: {
    nodeId: string
    conversationState: any
    sendToVoiceflow: (intent: string, data?: any) => void
  }
}

export interface V0ComponentManifest {
  components: V0Component[]
  lastSync: string
  v0ProjectId?: string
}

// For tracking component usage and performance
export interface V0ComponentAnalytics {
  componentId: string
  interactions: number
  averageViewTime: number
  conversionRate: number // How often it leads to deeper engagement
  userFeedback: {
    rating: number
    comments: string[]
  }
}