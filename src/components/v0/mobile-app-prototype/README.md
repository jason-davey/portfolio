# MobileAppPrototype

Interactive mobile app prototype showcase component for the adventure portfolio.

## Details

- **Component ID**: mobile-app-prototype
- **Original Prompt**: Create an interactive mobile app prototype showcase for a design portfolio
- **Created**: Sample component for v0.dev integration demo

## Adventure Integration

### Paths
- build-ship

### Voiceflow Triggers
- show_mobile_prototype
- demo_mobile_app

## Usage

```tsx
import { MobileAppPrototype } from './src/components/v0/mobile-app-prototype'

// In your adventure component
useVoiceflowVisualTrigger('show_mobile_prototype', (props) => {
  setActiveComponent('MobileAppPrototype')
  setComponentProps(props)
})
```

## Features

- Interactive screen navigation
- Feature exploration
- Adventure context awareness
- Voiceflow integration
- Responsive design
- Dark/light theme support

## Testing

```bash
# Test this component
npm run test:v0

# Test in browser console
window.v0Tester.testComponent('mobile-app-prototype', [
  {
    name: 'Basic rendering',
    props: {},
    expectedBehavior: 'Component renders correctly'
  },
  {
    name: 'Screen navigation',
    props: { interactive: true },
    expectedBehavior: 'User can navigate between screens'
  }
])
```