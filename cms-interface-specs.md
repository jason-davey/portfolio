# Portfolio CMS Interface Specifications

## 🎯 V0.dev Component Requirements

Based on your A/B testing CMS experience and strategic design storytelling research.

### 🏗️ Admin Dashboard Structure

```
/admin/
├── dashboard/           # Overview & analytics
├── projects/
│   ├── list/           # Project management table
│   ├── create/         # New project wizard
│   ├── [id]/edit/      # Edit project form
│   └── [id]/preview/   # Live preview
├── content/
│   ├── skills/         # Manage skills library
│   ├── sectors/        # Industry sectors
│   └── methodologies/  # Design methods
├── media/              # Asset management
├── globe/              # 3D preview integration
└── settings/           # System configuration
```

## 📋 Core Components for V0.dev

### 1. Project Creation Wizard

**Component**: `ProjectWizard.tsx`

```typescript
interface ProjectWizard {
  steps: [
    'Basic Info',      // Title, client, year, role
    'Classification',  // Sector, type, methodologies
    'Story Content',   // Hook, problem, opportunity, etc.
    'Assets & Media',  // Images, videos, documents
    'Metrics & Value', // Quantitative/qualitative outcomes
    'Settings'         // Status, visibility, SEO
  ]
}
```

**V0.dev Prompt:**
```
Create a multi-step project creation wizard with:
- 6 steps with progress indicator
- Form validation at each step
- Auto-save drafts functionality
- Rich text editors for story content
- File upload for assets
- Preview mode for each section
- Clean, professional design matching your A/B testing CMS aesthetics
```

### 2. Story Content Editor

**Component**: `StoryEditor.tsx`

```typescript
interface StoryContent {
  hook: {
    elevator_pitch: string;
    impact_headline: string;
    key_visual: FileUpload;
  };
  problem: {
    context: RichText;
    challenge_statement: string;
    stakeholder_pain_points: string[];
    business_constraints: string[];
    why_now: string;
  };
  opportunity: {
    research_insights: RichText;
    validation_methods: SelectMultiple;
    user_needs: string[];
    business_opportunity: RichText;
    strategic_alignment: string;
  };
  approach: {
    design_process: RichText;
    methodology_rationale: RichText;
    key_activities: string[];
    stakeholder_engagement: RichText;
    tools_techniques: SelectMultiple;
  };
  solution: {
    intervention_overview: RichText;
    key_deliverables: string[];
    implementation_strategy: RichText;
    change_management: RichText;
    innovation_elements: string[];
  };
  outcomes: {
    immediate_results: RichText;
    business_metrics: KeyValuePairs;
    user_impact: RichText;
    organizational_change: RichText;
    long_term_value: RichText;
  };
  reflection: {
    lessons_learned: RichText;
    challenges_overcome: RichText;
    what_worked_well: RichText;
    would_do_differently: RichText;
  };
}
```

**V0.dev Prompt:**
```
Create a structured story content editor with:
- Tabbed interface for each story section (Hook, Problem, Opportunity, etc.)
- Rich text editor with formatting options
- Dynamic array inputs for lists (pain points, deliverables, etc.)
- Character count indicators
- Real-time preview
- Templates for common patterns
- Drag-and-drop reordering for lists
- Auto-save every 30 seconds
```

### 3. Project Management Table

**Component**: `ProjectTable.tsx`

```typescript
interface ProjectTableRow {
  id: string;
  title: string;
  client: string;
  year: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  story_priority: number;
  last_updated: Date;
  actions: ['Edit', 'Preview', 'Clone', 'Delete'];
}
```

**V0.dev Prompt:**
```
Create a data table for project management with:
- Sortable columns (title, client, year, status, updated)
- Filter by status, sector, year range
- Search across title, client, content
- Bulk actions (publish, archive, delete)
- Inline editing for priority and featured status
- Quick preview modal
- Export functionality (CSV, PDF)
- Pagination with 25/50/100 per page options
- Clean table design with hover states
```

### 4. Media Asset Manager

**Component**: `AssetManager.tsx`

```typescript
interface AssetManager {
  upload: {
    drag_drop: boolean;
    file_types: ['.jpg', '.png', '.pdf', '.mp4', '.figma'];
    max_size: '10MB';
    batch_upload: boolean;
  };
  organization: {
    folders: ['Process Images', 'Before/After', 'Deliverables', 'Videos'];
    tags: string[];
    search: boolean;
    filters: ['type', 'date', 'project'];
  };
  preview: {
    grid_view: boolean;
    list_view: boolean;
    image_preview: boolean;
    metadata: boolean;
  };
}
```

**V0.dev Prompt:**
```
Create a comprehensive asset management system with:
- Drag-and-drop file upload with progress bars
- Grid and list view toggles
- File organization with folders and tags
- Image preview with lightbox
- Metadata editing (alt text, descriptions, tags)
- Search and filter capabilities
- Batch operations (move, delete, tag)
- Integration with Supabase Storage
- File compression for web optimization
- Usage tracking (which projects use which assets)
```

### 5. Metrics Dashboard

**Component**: `MetricsDashboard.tsx`

```typescript
interface MetricsDashboard {
  portfolio_stats: {
    total_projects: number;
    published_projects: number;
    featured_projects: number;
    total_clients: number;
    sectors_covered: number;
  };
  performance_metrics: {
    page_views: ChartData;
    project_engagement: ChartData;
    popular_projects: RankingList;
    search_terms: TagCloud;
  };
  content_insights: {
    completion_rates: ProgressBars;
    missing_content: AlertList;
    seo_scores: ScoreCards;
  };
}
```

**V0.dev Prompt:**
```
Create an analytics dashboard with:
- Key portfolio statistics cards
- Charts for project views and engagement
- Content completion progress bars
- SEO score indicators
- Popular projects ranking
- Missing content alerts
- Export reports functionality
- Responsive grid layout
- Interactive charts with hover details
- Date range selectors
```

### 6. Globe Integration Preview

**Component**: `GlobePreview.tsx`

```typescript
interface GlobePreview {
  integration: {
    project_positioning: DragDrop;
    environment_customization: ColorPicker;
    biome_selection: Dropdown;
    scale_adjustment: Slider;
  };
  real_time_preview: {
    three_js_embed: boolean;
    interaction_testing: boolean;
    responsive_preview: boolean;
  };
  publishing: {
    preview_mode: boolean;
    publish_changes: boolean;
    revert_changes: boolean;
  };
}
```

**V0.dev Prompt:**
```
Create a globe integration preview with:
- Embedded 3D globe viewer
- Drag-and-drop project positioning on globe surface
- Environment customization panel (colors, scales, biomes)
- Real-time preview updates
- Device/screen size preview toggles
- Publish/revert controls
- Performance monitoring
- Interaction testing tools
- Geographic coordinates display
- Project clustering options
```

## 🎨 Design System Integration

### Color Palette (Based on Your A/B Testing CMS)
```css
:root {
  --primary: #912680;      /* Your existing brand color */
  --secondary: #3CC78B;    /* Success green */
  --accent: #D3BE96;       /* Warm accent */
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-900: #111827;
}
```

### Component Library
- **Buttons**: Primary, Secondary, Ghost, Danger
- **Forms**: Input, Textarea, Select, Checkbox, Radio, FileUpload
- **Navigation**: Sidebar, Breadcrumbs, Tabs, Pagination
- **Data Display**: Table, Cards, Lists, Charts, Badges
- **Feedback**: Alerts, Toasts, Progress, Loading states
- **Layout**: Grid, Container, Spacer, Divider

## 🔄 API Integration Patterns

### Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Custom hooks for common operations
export const useProjects = () => {
  // React Query integration for projects
}

export const useProjectMutations = () => {
  // Create, update, delete operations
}
```

### Real-time Subscriptions
```typescript
// hooks/useRealTimeProjects.ts
export const useRealTimeProjects = () => {
  useEffect(() => {
    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects'
      }, (payload) => {
        // Update local state
        updateProjectsCache(payload);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);
}
```

## 📱 Responsive Considerations

### Mobile-First Approach
- **Dashboard**: Collapsible sidebar, card-based layout
- **Forms**: Single column, larger touch targets
- **Tables**: Horizontal scroll, row expansion
- **Media**: Swipe galleries, optimized uploads

### Tablet Optimization
- **Split views**: List + detail panes
- **Gesture support**: Swipe navigation, pinch zoom
- **Adaptive layouts**: 2-column grids

## 🚀 Implementation Phases

### Phase 1: Core CRUD (Week 1)
- [ ] Basic project creation form
- [ ] Project list table with search/filter
- [ ] Simple content editor
- [ ] File upload functionality

### Phase 2: Enhanced UX (Week 2)
- [ ] Multi-step wizard interface
- [ ] Rich text editing
- [ ] Asset management system
- [ ] Real-time auto-save

### Phase 3: Advanced Features (Week 3)
- [ ] Metrics dashboard
- [ ] Globe integration preview
- [ ] SEO optimization tools
- [ ] Export/import functionality

### Phase 4: Polish & Performance (Week 4)
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] User testing and refinements
- [ ] Production deployment

## 🎯 V0.dev Generation Strategy

### Recommended Approach:
1. **Start with individual components** - Generate one component at a time
2. **Build incrementally** - Test each component before moving to next
3. **Use your existing patterns** - Reference your A/B testing CMS for consistency
4. **Focus on functionality first** - Polish aesthetics in later iterations

### Sample V0.dev Prompts:

**For Project Creation Form:**
```
Create a professional project creation form with the following sections:
- Basic Info: Title, client, year, role (required fields)
- Project type, sector dropdown, methodology multi-select
- Rich text editor for challenge statement
- File upload for featured image
- Form validation with clear error messages
- Save draft and publish buttons
- Clean, modern design similar to Notion or Linear
- Use Tailwind CSS and shadcn/ui components
```

**For Project Table:**
```
Create a data table component for managing portfolio projects with:
- Columns: Title, Client, Year, Status, Featured, Last Updated, Actions
- Sortable headers with arrow indicators
- Search input with real-time filtering
- Status filter dropdown (All, Draft, Published, Archived)
- Bulk selection with checkboxes
- Action buttons: Edit, Preview, Clone, Delete
- Pagination with page size options
- Empty state with call-to-action
- Loading states and skeleton UI
- Professional design matching modern admin interfaces
```

Would you like me to start generating the first component with V0.dev, or would you prefer to set up the Supabase database first?