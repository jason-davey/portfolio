# 3D Globe + Portfolio CMS Integration Plan

## 🎯 Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Portfolio CMS (Supabase/PostgreSQL)         │
├─────────────────────────────────────────────────────────────┤
│  • Projects with geographic metadata                       │
│  • Skills, categories, sectors                            │
│  • Assets and testimonials                                │
│  • Real-time updates via subscriptions                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Layer                             │
├─────────────────────────────────────────────────────────────┤
│  • /api/projects - CRUD operations                        │
│  • /api/globe-data - Formatted for 3D visualization       │
│  • Real-time subscriptions for live updates               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                3D Globe Interface                          │
├─────────────────────────────────────────────────────────────┤
│  • Projects positioned by geographic location             │
│  • Dynamic environment generation                         │
│  • Interactive project details                            │
│  • Smooth transitions between projects                    │
└─────────────────────────────────────────────────────────────┘
```

## 🗺️ Geographic Project Mapping

### Project Location Assignment
Each project gets geographic coordinates based on:

```sql
-- Add to projects table
ALTER TABLE projects ADD COLUMN location JSONB DEFAULT '{}';

-- Example location structure:
{
  "city": "Sydney",
  "country": "Australia",
  "coordinates": {
    "lat": -33.8688,
    "lng": 151.2093
  },
  "region": "Asia Pacific"
}
```

### Environment Generation Logic
```javascript
// Globe environment mapping
const environmentMapping = {
  "Financial Services": {
    color: 0x4a90e2,
    objects: "businessObjects",
    biome: "urban"
  },
  "Technology": {
    color: 0x9013fe,
    objects: "techObjects",
    biome: "digital"
  },
  "Social Impact": {
    color: 0x7ed321,
    objects: "communityObjects",
    biome: "nature"
  }
}
```

## 🎮 Interactive Features

### 1. Project Discovery via Globe
- **Hover over regions** → Show project count
- **Click on environment** → Display project cards
- **Zoom into location** → Detailed project view
- **Filter by sector** → Highlight relevant environments

### 2. Real-time Updates
```javascript
// Supabase real-time subscription
supabase
  .channel('projects')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects'
  }, (payload) => {
    updateGlobeEnvironment(payload);
  })
  .subscribe();
```

### 3. Dynamic Environment Scaling
Projects automatically adjust environment complexity:
- **1-2 projects**: Simple objects
- **3-5 projects**: Medium complexity
- **6+ projects**: Rich, detailed environments

## 🎨 Visual Project Representation

### Environment Customization by Project Data
```javascript
function generateProjectEnvironment(projects) {
  const environment = {
    baseColor: getColorFromSector(projects[0].sector),
    objects: [],
    scale: Math.min(projects.length * 0.3, 2.0)
  };

  projects.forEach((project, index) => {
    environment.objects.push({
      type: getObjectType(project.categories),
      position: getPositionFromIndex(index),
      metadata: {
        title: project.title,
        client: project.client,
        year: project.year,
        outcomes: project.content.outcomes
      }
    });
  });

  return environment;
}
```

### Project Detail Integration
- **Click object** → Slide-out project details
- **Project navigation** → Smooth globe rotation
- **Timeline mode** → Chronological project journey
- **Skill filtering** → Show relevant projects

## 📊 Admin Interface Features

### Globe Management Panel
```
/admin/globe-preview/
├── Environment Editor       # Customize biomes per sector
├── Project Positioning     # Drag-drop geographic assignment
├── Visual Customization    # Colors, scales, object types
├── Preview Mode           # Test changes before publishing
└── Analytics             # Track user interactions
```

### Project-Globe Sync
- **Auto-positioning**: New projects auto-assign to geographic regions
- **Manual override**: Drag projects to specific globe locations
- **Environment templates**: Pre-configured biomes for common sectors
- **Real-time preview**: See changes immediately

## 🔄 Data Flow Example

### 1. Admin Creates Project
```javascript
// Admin interface
const newProject = {
  title: "ANZ Business Transformation",
  client: "ANZ Bank",
  sector: "Financial Services",
  location: { city: "Melbourne", coordinates: {...} },
  // ... other data
};

await createProject(newProject);
```

### 2. Globe Auto-Updates
```javascript
// Real-time subscription triggers
function onProjectCreated(project) {
  const environment = findOrCreateEnvironment(project.location);
  environment.addProject(project);
  globe.updateEnvironment(environment);
  globe.focusOnLocation(project.location);
}
```

### 3. User Interaction
```javascript
// Globe click handler
function onEnvironmentClick(environment) {
  const projects = environment.getProjects();
  showProjectCarousel(projects);
  updateURL(`/projects/${environment.region}`);
}
```

## 🎯 Implementation Phases

### Phase 1: Data Integration (Week 1)
- Set up Supabase with portfolio schema
- Create API endpoints for globe data
- Build basic admin CRUD interface

### Phase 2: Globe Enhancement (Week 2)
- Add geographic positioning to existing globe
- Implement project-driven environment generation
- Create interactive click handlers

### Phase 3: Admin Interface (Week 3)
- Build V0.dev admin interface for project management
- Add globe preview and positioning tools
- Implement real-time sync

### Phase 4: Polish & Features (Week 4)
- Add timeline navigation
- Implement filtering and search
- Performance optimization
- Mobile responsiveness

## 🚀 Technical Benefits

1. **Leverages Your Existing Skills**: Uses your A/B testing CMS patterns
2. **Cost Effective**: Supabase free tier + Vercel
3. **Real-time**: Live updates without page refresh
4. **Scalable**: Easy to add new projects and features
5. **Maintainable**: Familiar tech stack and patterns

## 📋 Next Steps

1. **Set up Supabase project** with portfolio schema
2. **Create basic admin interface** using V0.dev
3. **Integrate with existing 3D globe**
4. **Add first project** (ANZ transformation) as test case
5. **Iterate and enhance** based on results

Would you like me to start with Phase 1 - setting up the Supabase integration?