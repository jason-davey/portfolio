# v0.dev Integration

This directory contains components generated from v0.dev that integrate with the adventure portfolio.

## Workflow

1. **Design in v0.dev**: Create components using natural language prompts
2. **Export to Portfolio**: Copy generated code to this directory
3. **Integrate with Adventures**: Connect components to Voiceflow triggers
4. **Test Integration**: Use the v0 component tester

## Component Structure

```
src/components/v0/
├── README.md                    # This file
├── index.ts                     # Export all v0 components
├── types.ts                     # Shared types for v0 components
├── utils/                       # v0 component utilities
│   ├── v0ComponentTester.ts     # Testing utilities
│   └── v0Integration.ts         # Integration helpers
└── [component-name]/            # Individual v0 components
    ├── index.tsx                # Main component
    ├── types.ts                 # Component-specific types
    └── README.md                # v0 generation notes
```

## Integration with Adventure Paths

Each v0 component can be triggered by Voiceflow conversations:

```typescript
// In your adventure component
useVoiceflowVisualTrigger('show_mobile_prototype', (props) => {
  setActiveV0Component('MobileAppPrototype')
  setComponentProps(props)
})
```

## Development Commands

```bash
# Test v0 component integration
npm run test:v0

# Start dev server with v0 components
npm run dev:v0

# Generate component from v0 export
npm run v0:import [component-name]
```