// Mapping between Voiceflow conversation nodes and our React components
export interface VoiceflowNode {
  id: string
  title: string
  type: 'introduction' | 'choice' | 'story' | 'deep-dive' | 'handoff' | 'completion'
  voiceflowIntent: string
  reactComponent?: string
  visualTriggers?: string[]
  nextNodes: string[]
}

// Based on the Voiceflow export structure
export const voiceflowToReactMapping: VoiceflowNode[] = [
  // Entry Point
  {
    id: 'start',
    title: 'Make flow adventure',
    type: 'introduction',
    voiceflowIntent: 'welcome_adventure',
    reactComponent: 'AdventureEntryPoint',
    visualTriggers: ['show_pathways'],
    nextNodes: ['project_journey', 'mobile_app', 'problem_solving', 'brand_identity']
  },

  // Project Journey Path
  {
    id: 'project_journey',
    title: 'Project journey introduction',
    type: 'story',
    voiceflowIntent: 'explore_project_journey',
    reactComponent: 'ProjectJourneyIntro',
    visualTriggers: ['show_timeline', 'highlight_background'],
    nextNodes: ['mobile_app_design', 'problem_solving_process']
  },

  // Mobile App Adventure
  {
    id: 'mobile_app',
    title: 'Mobile app adventure',
    type: 'choice',
    voiceflowIntent: 'mobile_app_exploration',
    reactComponent: 'MobileAppShowcase',
    visualTriggers: ['show_mobile_mockups', 'interactive_prototype'],
    nextNodes: ['user_research_phase', 'visual_design_process', 'brand_identity_adventure']
  },

  // Problem-Solving Deep Dive
  {
    id: 'problem_solving',
    title: 'Problem-solving deep dive',
    type: 'deep-dive',
    voiceflowIntent: 'problem_solving_methodology',
    reactComponent: 'ProblemSolvingDeepDive',
    visualTriggers: ['show_process_diagram', 'case_study_details'],
    nextNodes: ['user_research_phase', 'continue_exploring_project']
  },

  // Brand Identity Adventures
  {
    id: 'brand_identity',
    title: 'Brand identity adventure',
    type: 'story',
    voiceflowIntent: 'brand_design_exploration',
    reactComponent: 'BrandIdentityShowcase',
    visualTriggers: ['show_brand_evolution', 'design_philosophy'],
    nextNodes: ['brand_discovery', 'concept_development']
  },

  // Deep Dive Nodes
  {
    id: 'user_research_phase',
    title: 'User research phase',
    type: 'deep-dive',
    voiceflowIntent: 'research_methodology',
    reactComponent: 'ResearchMethodology',
    visualTriggers: ['research_artifacts', 'user_insights'],
    nextNodes: ['continue_exploring_project', 'visual_design_process']
  },

  {
    id: 'brand_discovery',
    title: 'Brand discovery',
    type: 'deep-dive',
    voiceflowIntent: 'brand_discovery_process',
    reactComponent: 'BrandDiscoveryProcess',
    visualTriggers: ['discovery_workshop', 'brand_strategy'],
    nextNodes: ['concept_development', 'continue_exploring_brand_identity']
  },

  // Handoff Points (where Voiceflow passes to React for visual experiences)
  {
    id: 'visual_design_process',
    title: 'Visual design process',
    type: 'handoff',
    voiceflowIntent: 'show_design_process',
    reactComponent: 'DesignProcessVisualization',
    visualTriggers: ['interactive_design_steps', 'before_after_showcase'],
    nextNodes: ['collaboration_details', 'launch_highlights']
  },

  {
    id: 'collaboration_details',
    title: 'Collaboration details',
    type: 'handoff',
    voiceflowIntent: 'team_collaboration',
    reactComponent: 'CollaborationShowcase',
    visualTriggers: ['team_interaction_flow', 'stakeholder_journey'],
    nextNodes: ['creative_code_experiments', 'continue_exploring_web_experience']
  },

  // Completion Points
  {
    id: 'story_journey_completed',
    title: 'Story journey completed',
    type: 'completion',
    voiceflowIntent: 'journey_complete',
    reactComponent: 'JourneyCompletion',
    visualTriggers: ['show_recommendations', 'restart_adventure'],
    nextNodes: ['start', 'unmet_expectations']
  }
]

// API endpoints that Voiceflow can call to trigger React state changes
export const voiceflowApiEndpoints = {
  // Navigation
  navigateToNode: '/api/adventure/navigate',
  updateProgress: '/api/adventure/progress',
  
  // Visual Triggers
  showComponent: '/api/visual/show',
  hideComponent: '/api/visual/hide',
  animateTransition: '/api/visual/animate',
  
  // User Preferences
  updatePreferences: '/api/user/preferences',
  trackInteraction: '/api/user/interaction',
  
  // Content
  loadCaseStudy: '/api/content/case-study',
  showMediaGallery: '/api/content/media'
}