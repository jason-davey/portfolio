# Interactive Design Leadership Portfolio

A Choose Your Own Adventure portfolio showcasing design leadership through **triple-AI collaborative storytelling**.

## Triple-AI Architecture

- **Frontend**: React + TypeScript + Vite
- **AI Narrator**: Voiceflow conversational flows
- **AI Developer**: Claude Code for technical implementation
- **AI Designer**: v0.dev for visual component creation
- **Styling**: Mobile-first responsive design with Tailwind CSS
- **Testing**: Vitest + React Testing Library + Custom AI Integration Tests

## Revolutionary AI Collaboration

This portfolio demonstrates the **first known triple-AI collaboration**:
- **Voiceflow Narrator**: Guides users through interactive story paths
- **Claude Code**: Provides technical architecture and integration
- **v0.dev Designer**: Enables rapid visual component iteration using natural language
- **Seamless Integration**: Real-time handoffs between conversational, technical, and visual AI systems

## Adventure Paths

1. **Strategic Pathways** 🎯 - Business design and transformation
2. **Build & Ship** 🛠️ - Product design and development
3. **Conceptual Horizons** 🧠 - Innovation and future-thinking
4. **Team Alchemy** 👥 - Building design organizations
5. **Growth Catalyst** 🌱 - Mentoring and development

## Development Setup

```bash
# Install dependencies
npm install

# Start development server (adventure mode only)
npm run dev

# Start with v0.dev integration
npm run dev:v0

# Start with Voiceflow integration
npm run dev:with-voiceflow

# Start with full triple-AI integration
npm run dev:full

# Run tests
npm test

# Build for production
npm run build
```

## Triple-AI Integration Testing

The portfolio includes comprehensive testing for all AI system integrations:

```bash
# Test Voiceflow ↔ React integration
npm run test:integration

# Test v0.dev component integration
npm run test:v0

# Import new v0.dev components
npm run v0:import

# Test v0 components in browser console
window.v0Tester.testAllComponents()
```

## Project Structure

```
src/
├── components/           # React components
│   ├── v0/              # v0.dev generated components with AI integration
│   │   ├── utils/       # v0 integration and testing utilities
│   │   └── [component]/ # Individual v0 components
│   ├── AdventureEntryPoint.tsx    # Main adventure navigation
│   └── V0AdventureDemo.tsx        # v0.dev integration demo
├── hooks/               # Custom hooks including Voiceflow integration
├── data/                # Adventure paths and content
├── types/               # TypeScript interfaces
└── utils/               # Helper functions

scripts/
├── import-v0-component.js         # Interactive v0 component import wizard
└── test-v0-components.js          # v0 component testing utilities

docs/
├── development-sessions/          # Session documentation
├── methodology/                   # Triple-AI development methodology
└── v0-integration-guide.md        # Complete v0.dev integration guide

references/
└── exports-from-voiceflow/        # Conversation flow exports
```

## Contributing

This is a living portfolio that evolves through AI collaboration. Each development session is documented and version controlled.

## v0.dev Integration Workflow

### Quick Start with v0.dev
```bash
# 1. Design component in v0.dev using natural language
# 2. Import to portfolio
npm run v0:import

# 3. Test integration
npm run test:v0

# 4. View in action
npm run dev:v0
```

### Example v0.dev Prompt
```
"Create an interactive mobile app prototype showcase for a design portfolio. 
Include screen navigation, feature highlights, and call-to-action buttons. 
Make it responsive and include dark mode support."
```

## Innovation Achievement

This portfolio represents a **breakthrough in collaborative AI development**:

- **First known implementation** of real-time handoffs between three AI systems
- **Automated testing** of AI-to-AI integration points  
- **Natural language visual design** within conversational experiences
- **Replicable methodology** for multi-AI collaborative projects

## Documentation

- **[v0.dev Integration Guide](docs/v0-integration-guide.md)** - Complete technical documentation
- **[Triple-AI Methodology](docs/methodology/dual-ai-development.md)** - Development approach and patterns
- **[Development Sessions](docs/development-sessions/)** - Detailed session logs and decisions
- **[Integration Summary](INTEGRATION-SUMMARY.md)** - Quick reference and next steps

---

*Built with revolutionary triple-AI collaboration: Voiceflow + Claude Code + v0.dev*