// Export all v0.dev components and utilities

export * from './types'
export * from './utils/v0Integration'
export * from './utils/v0ComponentTester'

// Export individual v0 components as they're added
export { MobileAppPrototype, MobileAppPrototypeMetadata } from './mobile-app-prototype'
// Example:
// export { TeamDashboard } from './team-dashboard'
// export { StrategyCanvas } from './strategy-canvas'

// Component registry - automatically populated as components are added
export const V0_COMPONENTS = {
  // This will be populated by individual component exports
}

// Initialize v0 integration when module is imported
import { V0Integration } from './utils/v0Integration'

// Auto-register components when they're imported
// This happens automatically when components export their metadata