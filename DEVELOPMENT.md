# Triple-AI Iterative Development Workflow

## Voiceflow ↔ React ↔ v0.dev Integration Testing

### Development Philosophy
Test small, incremental changes across all three AI platforms to ensure tight integration without breaking the collaborative AI experience. Each AI system maintains its strengths while enabling seamless handoffs.

### Workflow Steps

#### 1. **Voiceflow Changes**
When updating conversation flows in Voiceflow:
1. Export the updated flow diagram to `references/exports-from-voiceflow/`
2. Update the mapping in `src/data/voiceflowMapping.ts`
3. Test integration points using the development tester
4. Commit changes with descriptive message

#### 2. **v0.dev Component Creation**
When designing new visual components:
1. Design component in v0.dev using natural language prompts
2. Import using `npm run v0:import` wizard
3. Specify adventure paths and Voiceflow triggers
4. Test integration with `npm run test:v0`
5. Commit with `npm run commit:v0`

#### 3. **React Integration Changes**
When building custom React components:
1. Create component with Voiceflow and v0 integration hooks
2. Add to integration tester for simulated testing
3. Update mapping and API endpoints as needed
4. Test with simulated Voiceflow messages
5. Commit and document integration points

#### 4. **Triple-AI Integration Testing Cycle**

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

### Branch Strategy

- `main` - Stable, working triple-AI integration
- `voiceflow-updates` - Conversation flow changes  
- `v0-components` - v0.dev visual component development
- `react-components` - Custom React component development
- `integration-testing` - Testing new AI handoff points

### Testing Checklist

Before each commit:
- [ ] Voiceflow conversation flows export updated
- [ ] v0.dev components imported and tested (`npm run test:v0`)
- [ ] React components respond to simulated messages
- [ ] Integration mapping updated for all AI systems
- [ ] No broken handoff points between any AI systems
- [ ] Mobile-first responsive design maintained
- [ ] All tests passing (`npm test` and `npm run test:v0`)
- [ ] Browser console testing validated

### Integration Milestones

**Phase 1**: Basic handoffs (conversation → visual trigger) ✅
**Phase 2**: Bidirectional communication (user action → conversation response) ✅  
**Phase 3**: v0.dev integration (natural language → visual components) ✅
**Phase 4**: Triple-AI handoffs (conversation → v0 component → interaction feedback) ✅
**Phase 5**: Personalized experiences (user journey tracking across all AI systems)
**Phase 6**: Dynamic content adaptation and A/B testing

### Debugging Integration Issues

1. **Check browser console** for Voiceflow message logs
2. **Use integration tester** to simulate specific flows
3. **Validate component mounting** with test IDs
4. **Review mapping file** for correct node IDs

### Deployment Strategy

- **Development**: Local with simulated Voiceflow and v0.dev integration testing
- **Staging**: Integration with Voiceflow prototype and live v0.dev components
- **Production**: Full triple-AI integration (Voiceflow + v0.dev + Claude Code)

### New Development Commands

```bash
# Triple-AI development modes
npm run dev:v0          # v0.dev integration only
npm run dev:full        # All AI systems enabled

# v0.dev workflow
npm run v0:import       # Import v0.dev components
npm run test:v0         # Test v0 integration
npm run commit:v0       # Commit v0 changes

# Testing
window.v0Tester.testAllComponents()           # Browser console
window.v0Tester.testComponent('component-id') # Specific component
```

---

*This workflow ensures all three AI systems evolve together harmoniously, creating unprecedented collaborative development experiences.*