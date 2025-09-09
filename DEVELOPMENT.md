# Iterative Development Workflow

## Voiceflow ↔ React Integration Testing

### Development Philosophy
Test small, incremental changes between both platforms to ensure tight integration without breaking the collaborative AI experience.

### Workflow Steps

#### 1. **Voiceflow Changes**
When updating conversation flows in Voiceflow:
1. Export the updated flow diagram to `references/exports-from-voiceflow/`
2. Update the mapping in `src/data/voiceflowMapping.ts`
3. Test integration points using the development tester
4. Commit changes with descriptive message

#### 2. **React Component Changes**
When building new visual components:
1. Create component with Voiceflow integration hooks
2. Add to integration tester for simulated testing
3. Update mapping and API endpoints as needed
4. Test with simulated Voiceflow messages
5. Commit and document integration points

#### 3. **Integration Testing Cycle**

```bash
# Start development environment with integration testing
npm run dev

# In browser console, test Voiceflow integration:
window.voiceflowTester.testFlow("mobile_app_adventure")

# Validate integration points
window.voiceflowTester.validate()
```

### Branch Strategy

- `main` - Stable, working integration
- `voiceflow-updates` - Conversation flow changes  
- `react-components` - Visual component development
- `integration-testing` - Testing new handoff points

### Testing Checklist

Before each commit:
- [ ] Voiceflow conversation flows export updated
- [ ] React components respond to simulated messages
- [ ] Integration mapping updated
- [ ] No broken handoff points
- [ ] Mobile-first responsive design maintained
- [ ] Tests passing

### Integration Milestones

**Phase 1**: Basic handoffs (conversation → visual trigger)
**Phase 2**: Bidirectional communication (user action → conversation response)  
**Phase 3**: Personalized experiences (user journey tracking)
**Phase 4**: Dynamic content adaptation

### Debugging Integration Issues

1. **Check browser console** for Voiceflow message logs
2. **Use integration tester** to simulate specific flows
3. **Validate component mounting** with test IDs
4. **Review mapping file** for correct node IDs

### Deployment Strategy

- **Development**: Local with simulated Voiceflow
- **Staging**: Integration with Voiceflow prototype
- **Production**: Full Voiceflow widget integration

---

*This workflow ensures both AI systems evolve together harmoniously.*