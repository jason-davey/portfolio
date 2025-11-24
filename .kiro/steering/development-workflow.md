---
inclusion: manual
---

# Development Workflow Context

## Triple-AI Integration Testing Cycle
```bash
# Start development environment with full integration
npm run dev:full

# Test v0.dev component integration
npm run test:v0

# In browser console, test all AI integrations:
window.voiceflowTester.testFlow("mobile_app_adventure")
window.v0Tester.testAllComponents()

# Validate all integration points
window.voiceflowTester.validate()
window.v0Tester.testVoiceflowIntegration('component-id', ['trigger'])
```

## Current Development Commands
- `npm run dev:v0` - v0.dev integration only
- `npm run dev:full` - All AI systems enabled
- `npm run v0:import` - Import v0.dev components
- `npm run test:v0` - Test v0 integration
- `npm run commit:v0` - Commit v0 changes

## Integration Status
- ✅ Phase 1: Basic handoffs (conversation → visual trigger)
- ✅ Phase 2: Bidirectional communication (user action → conversation response)  
- ✅ Phase 3: v0.dev integration (natural language → visual components)
- ✅ Phase 4: Triple-AI handoffs (conversation → v0 component → interaction feedback)
- 🔄 Phase 5: Personalized experiences (user journey tracking across all AI systems)
- 🔄 Phase 6: Dynamic content adaptation and A/B testing