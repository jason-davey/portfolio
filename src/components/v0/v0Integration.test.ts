import { describe, it, expect, beforeEach } from 'vitest'
import { V0Integration } from './utils/v0Integration'
import { V0ComponentTester } from './utils/v0ComponentTester'
import { MobileAppPrototypeMetadata } from './mobile-app-prototype'

describe('V0 Integration', () => {
  beforeEach(() => {
    // Clear any existing components
    V0Integration['components'].clear()
  })

  describe('Component Registration', () => {
    it('should register a v0 component', () => {
      V0Integration.registerComponent(MobileAppPrototypeMetadata)
      
      const component = V0Integration.getComponent('mobile-app-prototype')
      expect(component).toBeDefined()
      expect(component?.name).toBe('MobileAppPrototype')
    })

    it('should get components for adventure path', () => {
      V0Integration.registerComponent(MobileAppPrototypeMetadata)
      
      const components = V0Integration.getComponentsForPath('build-ship')
      expect(components).toHaveLength(1)
      expect(components[0].id).toBe('mobile-app-prototype')
    })

    it('should get components for Voiceflow trigger', () => {
      V0Integration.registerComponent(MobileAppPrototypeMetadata)
      
      const components = V0Integration.getComponentsForTrigger('show_mobile_prototype')
      expect(components).toHaveLength(1)
      expect(components[0].id).toBe('mobile-app-prototype')
    })
  })

  describe('Props Creation', () => {
    beforeEach(() => {
      V0Integration.registerComponent(MobileAppPrototypeMetadata)
    })

    it('should create component props with adventure context', () => {
      const adventureContext = {
        currentPath: 'build-ship',
        userPreferences: { focus: 'process' },
        visitedNodes: ['intro']
      }

      const voiceflowContext = {
        nodeId: 'show-prototype',
        sendToVoiceflow: () => {}
      }

      const props = V0Integration.createComponentProps(
        'mobile-app-prototype',
        adventureContext,
        voiceflowContext
      )

      expect(props.adventureContext).toEqual(adventureContext)
      expect(props.voiceflowContext).toEqual(voiceflowContext)
      expect(props.animated).toBe(true)
      expect(props.interactive).toBe(true)
    })

    it('should merge custom props', () => {
      const customProps = {
        size: 'lg',
        theme: 'dark',
        appName: 'CustomApp'
      }

      const props = V0Integration.createComponentProps(
        'mobile-app-prototype',
        {},
        {},
        customProps
      )

      expect(props.size).toBe('lg')
      expect(props.theme).toBe('dark')
      expect(props.appName).toBe('CustomApp')
    })
  })

  describe('Component Testing', () => {
    beforeEach(() => {
      V0Integration.registerComponent(MobileAppPrototypeMetadata)
    })

    it('should test component with scenarios', async () => {
      const testScenarios = [
        {
          name: 'Default rendering',
          props: {},
          expectedBehavior: 'Component renders with default props'
        },
        {
          name: 'Interactive mode',
          props: { interactive: true },
          expectedBehavior: 'Component handles interactions'
        }
      ]

      const result = await V0ComponentTester.testComponent(
        'mobile-app-prototype',
        testScenarios
      )

      expect(result).toBe(true)
    })

    it('should test Voiceflow integration', () => {
      const result = V0ComponentTester.testVoiceflowIntegration(
        'mobile-app-prototype',
        ['show_mobile_prototype', 'demo_mobile_app']
      )

      expect(result).toBe(true)
    })

    it('should test adventure path integration', () => {
      const result = V0ComponentTester.testAdventurePaths('mobile-app-prototype')
      expect(result).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle missing component gracefully', () => {
      const component = V0Integration.getComponent('non-existent')
      expect(component).toBeUndefined()
    })

    it('should return empty array for non-existent path', () => {
      const components = V0Integration.getComponentsForPath('non-existent')
      expect(components).toHaveLength(0)
    })

    it('should return empty array for non-existent trigger', () => {
      const components = V0Integration.getComponentsForTrigger('non-existent')
      expect(components).toHaveLength(0)
    })
  })
})