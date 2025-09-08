# Interactive Design Leadership Portfolio

A Choose Your Own Adventure portfolio showcasing design leadership through collaborative AI storytelling.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **AI Narrator**: Voiceflow conversational flows
- **AI Developer**: Claude Code for technical implementation
- **Styling**: Mobile-first responsive design
- **Testing**: Vitest + React Testing Library

## Collaborative AI Experience

This portfolio demonstrates dual-AI collaboration:
- **Voiceflow Narrator**: Guides users through interactive story paths
- **Claude Code**: Provides visual components and technical implementation
- **Seamless Integration**: Real-time handoffs between conversational and visual storytelling

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

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Integration Testing

The portfolio includes a staging environment for testing Voiceflow ↔ React integration:

```bash
# Start with Voiceflow integration
npm run dev:with-voiceflow

# Run integration tests
npm run test:integration
```

## Project Structure

```
src/
├── components/           # React components
├── hooks/               # Custom hooks including Voiceflow integration
├── data/                # Adventure paths and content
├── types/               # TypeScript interfaces
└── utils/               # Helper functions

references/
└── exports-from-voiceflow/  # Conversation flow exports
```

## Contributing

This is a living portfolio that evolves through AI collaboration. Each development session is documented and version controlled.

---

*Built with collaborative AI: Voiceflow + Claude Code*