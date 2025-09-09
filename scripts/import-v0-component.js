#!/usr/bin/env node

// Script to import a v0.dev component into the adventure portfolio

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const COMPONENTS_DIR = path.join(__dirname, '../src/components/v0')

function createComponentDirectory(componentName) {
  const componentId = componentName.toLowerCase().replace(/\s+/g, '-')
  const componentDir = path.join(COMPONENTS_DIR, componentId)
  
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }
  
  return { componentDir, componentId }
}

function promptForInput(question) {
  return new Promise((resolve) => {
    process.stdout.write(question)
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim())
    })
  })
}

async function importV0Component() {
  console.log('🎨 v0.dev Component Importer')
  console.log('================================\n')
  
  // Get component details
  const componentName = await promptForInput('Component name: ')
  const designPrompt = await promptForInput('Original v0 design prompt (optional): ')
  const v0Url = await promptForInput('v0.dev URL (optional): ')
  const adventurePaths = await promptForInput('Adventure paths (comma-separated, e.g., build-ship,strategic): ')
  const voiceflowTriggers = await promptForInput('Voiceflow triggers (comma-separated, e.g., show_prototype,demo_app): ')
  
  console.log('\n📋 Paste your v0.dev component code below.')
  console.log('Press Ctrl+D (or Cmd+D on Mac) when finished:\n')
  
  // Read v0 code from stdin
  let v0Code = ''
  process.stdin.setEncoding('utf8')
  
  return new Promise((resolve) => {
    process.stdin.on('data', (chunk) => {
      v0Code += chunk
    })
    
    process.stdin.on('end', () => {
      const { componentDir, componentId } = createComponentDirectory(componentName)
      
      // Parse inputs
      const pathsArray = adventurePaths ? adventurePaths.split(',').map(p => p.trim()) : []
      const triggersArray = voiceflowTriggers ? voiceflowTriggers.split(',').map(t => t.trim()) : []
      
      // Generate component files
      generateComponentFiles(componentDir, componentName, componentId, {
        designPrompt,
        v0Url,
        adventurePaths: pathsArray,
        voiceflowTriggers: triggersArray,
        v0Code: v0Code.trim()
      })
      
      console.log(`\n✅ Component "${componentName}" imported successfully!`)
      console.log(`📁 Location: src/components/v0/${componentId}/`)
      console.log(`\n🚀 Next steps:`)
      console.log(`1. Review the generated component in ${componentId}/index.tsx`)
      console.log(`2. Test with: npm run test:v0`)
      console.log(`3. Start dev server: npm run dev:v0`)
      console.log(`4. Commit changes: npm run commit:v0`)
      
      resolve()
    })
  })
}

function generateComponentFiles(componentDir, componentName, componentId, metadata) {
  // Generate main component file
  const componentContent = generateComponentCode(componentName, componentId, metadata)
  fs.writeFileSync(path.join(componentDir, 'index.tsx'), componentContent)
  
  // Generate component-specific types
  const typesContent = generateTypesFile(componentName, componentId)
  fs.writeFileSync(path.join(componentDir, 'types.ts'), typesContent)
  
  // Generate README
  const readmeContent = generateReadmeFile(componentName, componentId, metadata)
  fs.writeFileSync(path.join(componentDir, 'README.md'), readmeContent)
  
  // Update main v0 index file
  updateMainIndex(componentName, componentId)
}

function generateComponentCode(componentName, componentId, metadata) {
  return `import React from 'react'
import { V0ComponentProps } from '../types'

// Generated from v0.dev
// Original prompt: ${metadata.designPrompt || 'Not provided'}
// v0.dev URL: ${metadata.v0Url || 'Not provided'}
// Adventure paths: ${metadata.adventurePaths.join(', ') || 'None specified'}
// Voiceflow triggers: ${metadata.voiceflowTriggers.join(', ') || 'None specified'}

interface ${componentName}Props extends V0ComponentProps {
  // Add component-specific props here
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  animated = true,
  theme = 'auto',
  size = 'md',
  interactive = true,
  onInteraction,
  adventureContext,
  voiceflowContext,
  ...props
}) => {
  // Handle interactions with Voiceflow
  const handleInteraction = (action: string, data?: any) => {
    onInteraction?.(action, data)
  }

  // v0.dev generated code starts here
  ${metadata.v0Code}
  // v0.dev generated code ends here
}

export default ${componentName}

// Component metadata for registration
export const ${componentName}Metadata = {
  id: '${componentId}',
  name: '${componentName}',
  description: 'Generated from v0.dev - ${metadata.designPrompt || 'Interactive component'}',
  adventurePaths: ${JSON.stringify(metadata.adventurePaths)},
  voiceflowTriggers: ${JSON.stringify(metadata.voiceflowTriggers)},
  v0Url: '${metadata.v0Url || ''}',
  metadata: {
    createdAt: '${new Date().toISOString()}',
    lastUpdated: '${new Date().toISOString()}',
    designPrompt: '${metadata.designPrompt || ''}',
    v0Url: '${metadata.v0Url || ''}'
  }
}

// Auto-register component when imported
import { V0Integration } from '../utils/v0Integration'
V0Integration.registerComponent(${componentName}Metadata)`
}

function generateTypesFile(componentName, componentId) {
  return `// Types specific to ${componentName}

export interface ${componentName}Data {
  // Define data structure for this component
}

export interface ${componentName}Actions {
  // Define available actions for this component
}

export interface ${componentName}State {
  // Define internal state structure
}`
}

function generateReadmeFile(componentName, componentId, metadata) {
  return `# ${componentName}

Generated from v0.dev for the adventure portfolio.

## Details

- **Component ID**: ${componentId}
- **Original Prompt**: ${metadata.designPrompt || 'Not provided'}
- **v0.dev URL**: ${metadata.v0Url || 'Not provided'}
- **Created**: ${new Date().toISOString()}

## Adventure Integration

### Paths
${metadata.adventurePaths.map(path => `- ${path}`).join('\n') || '- None specified'}

### Voiceflow Triggers
${metadata.voiceflowTriggers.map(trigger => `- ${trigger}`).join('\n') || '- None specified'}

## Usage

\`\`\`tsx
import { ${componentName} } from './src/components/v0/${componentId}'

// In your adventure component
useVoiceflowVisualTrigger('${metadata.voiceflowTriggers[0] || 'your_trigger'}', (props) => {
  setActiveComponent('${componentName}')
  setComponentProps(props)
})
\`\`\`

## Testing

\`\`\`bash
# Test this component
npm run test:v0

# Test in browser console
window.v0Tester.testComponent('${componentId}', [
  {
    name: 'Basic rendering',
    props: {},
    expectedBehavior: 'Component renders correctly'
  }
])
\`\`\`

## Iteration

To update this component:
1. Make changes in v0.dev
2. Copy the updated code
3. Replace the code section in index.tsx
4. Update the lastUpdated timestamp
5. Test and commit changes`
}

function updateMainIndex(componentName, componentId) {
  const indexPath = path.join(COMPONENTS_DIR, 'index.ts')
  let indexContent = fs.readFileSync(indexPath, 'utf8')
  
  // Add export for new component
  const exportLine = `export { ${componentName}, ${componentName}Metadata } from './${componentId}'`
  
  if (!indexContent.includes(exportLine)) {
    // Find the line with "// Example:" and add after it
    const lines = indexContent.split('\n')
    const exampleIndex = lines.findIndex(line => line.includes('// Example:'))
    
    if (exampleIndex !== -1) {
      lines.splice(exampleIndex + 3, 0, exportLine)
      indexContent = lines.join('\n')
      fs.writeFileSync(indexPath, indexContent)
    }
  }
}

// Run the importer
if (process.argv[1] === __filename) {
  importV0Component().then(() => {
    process.exit(0)
  }).catch((error) => {
    console.error('❌ Error importing component:', error)
    process.exit(1)
  })
}`