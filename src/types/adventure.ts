// Core adventure narrative types
export interface AdventurePath {
  id: string
  title: string
  subtitle: string
  icon: string
  description: string
  color: string
  gradient: string
}

export interface StoryNode {
  id: string
  title: string
  content: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'interactive'
  choices: Choice[]
  pathId: string
  tags: string[]
  connections: string[] // Related story nodes
}

export interface Choice {
  id: string
  text: string
  description: string
  targetNodeId: string
  pathId?: string // For cross-path navigation
  unlocks?: string[] // Story nodes this choice unlocks
}

export interface UserJourney {
  visitedNodes: string[]
  currentPath: string
  startTime: number
  preferences: {
    depth: 'surface' | 'deep'
    focus: 'process' | 'outcomes' | 'strategy'
    role: 'recruiter' | 'peer' | 'client' | 'curious'
  }
}

export interface CaseStudy {
  id: string
  title: string
  client?: string
  timeframe: string
  role: string
  challenge: string
  approach: string
  outcome: string
  impact: string[]
  skills: string[]
  pathIds: string[] // Which adventure paths this belongs to
  storyNodes: string[] // Multiple narrative perspectives
  media: {
    hero?: string
    gallery?: string[]
    process?: string[]
  }
}