# v0.dev Integration Guide

Complete guide for integrating v0.dev components into your adventure portfolio.

## Overview

This integration allows you to:
- Design components visually in v0.dev using natural language
- Import them seamlessly into your adventure portfolio
- Connect them to Voiceflow conversation triggers
- Test integration points during development
- Maintain a collaborative AI workflow

## Quick Start

### 1. Enable v0 Integration

```bash
# Start development with v0 integration
npm run dev:v0

# Or start with both Voiceflow and v0
npm run dev:full
```

### 2. Import a v0 Component

```bash
# Interactive import wizard
npm run v0:import

# Follow the prompts:
# - Component name: "ProjectShowcase"
# - Design prompt: "Create an interactive project gallery"
# - Adventure paths: "build-ship,strategic"
# - Voiceflow triggers: "show_projects,demo_work"
# - Paste your v0.dev code when prompted
```

### 3. Test Integration

```bash
# Test all v0 components
npm run test:v0

# Or test in browser console
window.v0Tester.testComponent('project-showcase', [
  {
    name: 'Basic rendering',
    props: {},
    expectedBehavior: 'Component renders correctly'
  }
])
```

## Workflow

### Design Phase (v0.dev)

1. **Open v0.dev** in your browser
2. **Describe your component** using natural language:
   ```
   "Create an interactive mobile app prototype showcase for a design portfolio. 
   Include screen navigation, feature highlights, and call-to-action buttons. 
   Make it responsive and include dark mode support."
   ```
3. **Iterate on the design** until you're happy with the result
4. **Copy the generated code** for import

### Import Phase (Portfolio)

1. **Run the import command**:
   ```bash
   npm run v0:import
   ```

2. **Provide component details**:
   - **Component name**: PascalCase name (e.g., "MobileAppPrototype")
   - **Design prompt**: Original v0 prompt for reference
   - **v0.dev URL**: Link back to v0 for future iterations
   - **Adventure paths**: Which story paths use this component
   - **Voiceflow triggers**: Events that show this component

3. **Paste the v0 code** when prompted

4. **Review generated files**:
   ```
   src/components/v0/mobile-app-prototype/
   ├── index.tsx        # Main component with integration
   ├── types.ts         # Component-specific types
   └── README.md        # Usage and testing info
   ```

### Integration Phase

The imported component automatically includes:

- **Adventure context awareness**
- **Voiceflow integration hooks**
- **Interaction tracking**
- **Theme and responsive support**
- **Testing utilities**

### Testing Phase

```bash
# Run comprehensive tests
npm run test:v0

# Test specific component
window.v0Tester.testComponent('mobile-app-prototype', [
  {
    name: 'Screen navigation',
    props: { interactive: true },
    expectedBehavior: 'User can navigate between screens'
  },
  {
    name: 'Voiceflow integration',
    props: { voiceflowContext: mockContext },
    expectedBehavior: 'Sends interactions to Voiceflow'
  }
])
```

## Component Structure

### Generated Component Template

```tsx
import React from 'react'
import { V0ComponentProps } from '../types'

interface YourComponentProps extends V0ComponentProps {
  // Component-specific props
}

export const YourComponent: React.FC<YourComponentProps> = ({
  animated = true,
  theme = 'auto',
  size = 'md',
  interactive = true,
  onInteraction,
  adventureContext,
  voiceflowContext,
  ...props
}) => {
  const handleInteraction = (action: string, data?: any) => {
    onInteraction?.(action, data)
  }

  // Your v0.dev code here
  return (
    <div>
      {/* v0 generated JSX */}
    </div>
  )
}

// Auto-registration metadata
export const YourComponentMetadata = {
  id: 'your-component',
  name: 'YourComponent',
  description: 'Generated from v0.dev',
  adventurePaths: ['build-ship'],
  voiceflowTriggers: ['show_component'],
  metadata: {
    createdAt: '2025-09-09T...',
    designPrompt: 'Your original prompt',
    v0Url: 'https://v0.dev/...'
  }
}
```

### Integration Props

Every v0 component receives these props:

```typescript
interface V0ComponentProps {
  // Visual settings
  animated?: boolean
  theme?: 'light' | 'dark' | 'auto'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  
  // Adventure context
  adventureContext?: {
    currentPath: string
    userPreferences: any
    visitedNodes: string[]
  }
  
  // Voiceflow integration
  voiceflowContext?: {
    nodeId: string
    conversationState: any
    sendToVoiceflow: (intent: string, data?: any) => void
  }
  
  // Interaction handler
  onInteraction?: (action: string, data?: any) => void
}
```

## Voiceflow Integration

### Triggering Components

In your adventure components:

```tsx
import { useVoiceflowVisualTrigger } from '../hooks/useVoiceflowIntegration'
import { YourV0Component } from './v0/your-component'

// Listen for Voiceflow triggers
useVoiceflowVisualTrigger('show_mobile_prototype', (props) => {
  setActiveComponent('YourV0Component')
  setComponentProps(props)
})
```

### Sending Interactions Back

Components automatically send interactions to Voiceflow:

```tsx
// In your v0 component
const handleButtonClick = () => {
  onInteraction?.('user_clicked_cta', {
    componentId: 'mobile-prototype',
    buttonType: 'view_more_projects'
  })
}
```

This triggers Voiceflow with the intent `component_interaction` and the provided data.

## Adventure Path Integration

### Registering Components

Components are automatically registered when imported:

```typescript
// In component file
V0Integration.registerComponent({
  id: 'mobile-app-prototype',
  name: 'MobileAppPrototype',
  adventurePaths: ['build-ship', 'strategic'],
  voiceflowTriggers: ['show_mobile_prototype', 'demo_app']
})
```

### Using in Adventures

```tsx
// Get components for current path
const pathComponents = V0Integration.getComponentsForPath('build-ship')

// Get components for trigger
const triggerComponents = V0Integration.getComponentsForTrigger('show_prototype')
```

## Development Commands

### Core Commands

```bash
# Development servers
npm run dev:v0          # v0 integration only
npm run dev:full        # Voiceflow + v0 integration

# Component management
npm run v0:import       # Import new v0 component
npm run v0:test         # Test v0 components

# Testing
npm run test:v0         # Run v0 integration tests
npm run test:integration # All integration tests

# Commits
npm run commit:v0       # Commit v0 component changes
```

### Browser Console Testing

```javascript
// Test specific component
window.v0Tester.testComponent('mobile-app-prototype', [
  {
    name: 'Interactive features',
    props: { interactive: true },
    expectedBehavior: 'Handles user interactions'
  }
])

// Test all components
window.v0Tester.testAllComponents()

// Test Voiceflow integration
window.v0Tester.testVoiceflowIntegration('mobile-app-prototype', [
  'show_mobile_prototype'
])
```

## Best Practices

### Design in v0.dev

1. **Be specific in prompts**: Include details about interactivity, responsive design, and theme support
2. **Consider the context**: Design for portfolio/showcase use cases
3. **Plan for integration**: Think about what interactions should trigger Voiceflow responses

### Component Development

1. **Keep v0 code separate**: Don't modify the generated code directly
2. **Add integration logic**: Use the provided hooks and props for adventure integration
3. **Handle interactions**: Always call `onInteraction` for user actions
4. **Test thoroughly**: Use the testing utilities before committing

### Adventure Integration

1. **Map triggers carefully**: Ensure Voiceflow triggers match component registration
2. **Provide context**: Pass relevant adventure and user context to components
3. **Handle responses**: Listen for component interactions in your adventure logic

## Troubleshooting

### Common Issues

**Component not showing up**
- Check if it's registered: `V0Integration.getComponent('component-id')`
- Verify adventure path mapping
- Ensure Voiceflow trigger is correct

**Interactions not working**
- Check `onInteraction` prop is passed
- Verify Voiceflow context is provided
- Test with browser console: `window.v0Tester`

**Styling conflicts**
- Use Tailwind classes (already configured)
- Check theme prop is being used
- Ensure responsive design works

**Import errors**
- Verify v0 code is valid React/TypeScript
- Check for missing imports
- Run `npm run test:v0` to validate

### Debug Mode

Enable debug logging:

```bash
# Start with debug logging
VITE_V0_DEBUG=true npm run dev:v0
```

This will log all v0 component interactions and integration events.

## Examples

### Complete Workflow Example

1. **Design in v0.dev**:
   ```
   "Create a team dashboard component showing project progress, 
   team member avatars, and key metrics. Include interactive 
   charts and a dark mode toggle."
   ```

2. **Import to portfolio**:
   ```bash
   npm run v0:import
   # Component name: TeamDashboard
   # Adventure paths: team-alchemy,strategic
   # Voiceflow triggers: show_team_dashboard,demo_leadership
   ```

3. **Use in adventure**:
   ```tsx
   useVoiceflowVisualTrigger('show_team_dashboard', (props) => {
     setActiveComponent('TeamDashboard')
     setComponentProps({
       ...props,
       teamData: currentTeamData,
       interactive: true
     })
   })
   ```

4. **Test integration**:
   ```bash
   npm run test:v0
   ```

5. **Commit changes**:
   ```bash
   npm run commit:v0
   ```

## Advanced Features

### Custom Component Props

Add component-specific props by extending the interface:

```typescript
interface TeamDashboardProps extends V0ComponentProps {
  teamData?: TeamMember[]
  showMetrics?: boolean
  chartType?: 'bar' | 'line' | 'pie'
}
```

### Analytics Integration

Track component usage:

```typescript
// Components automatically track interactions
// Access analytics via V0Integration
const analytics = V0Integration.getComponentAnalytics('component-id')
```

### Dynamic Component Loading

Load components based on user preferences:

```typescript
const getRecommendedComponents = (userPreferences: UserPreferences) => {
  return V0Integration.getComponentsForPath(userPreferences.currentPath)
    .filter(component => 
      component.metadata.tags?.some(tag => 
        userPreferences.interests.includes(tag)
      )
    )
}
```

## Future Enhancements

### Planned Features

- **Visual component editor**: Edit v0 components directly in the portfolio
- **A/B testing**: Test different versions of components
- **Performance monitoring**: Track component load times and interactions
- **Auto-sync with v0.dev**: Automatically pull updates from v0 projects

### Contributing

To add new features to the v0 integration:

1. Update the integration utilities in `src/components/v0/utils/`
2. Add tests in `src/components/v0/v0Integration.test.ts`
3. Update this documentation
4. Submit a pull request

---

**This integration represents a breakthrough in collaborative AI development, enabling seamless visual design iteration within a conversational AI portfolio experience.**