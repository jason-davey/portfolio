# Portfolio CMS Architecture Plan

## 🎯 Recommended Approach: Headless CMS + Next.js

### Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                     │
├─────────────────────────────────────────────────────────────┤
│  • 3D Globe Portfolio Interface                            │
│  • Project Detail Pages                                    │
│  • Dynamic Routing                                         │
│  • SSG for Performance                                     │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (Next.js API)                  │
├─────────────────────────────────────────────────────────────┤
│  • Content fetching                                        │
│  • Search & filtering                                      │
│  • Image optimization                                      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Headless CMS (Strapi/Sanity)               │
├─────────────────────────────────────────────────────────────┤
│  • Project Management                                      │
│  • Asset Management                                        │
│  • Content Relationships                                   │
│  • User-friendly Admin Interface                           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Content Models

### Project Model
```javascript
{
  title: "String",
  slug: "String (auto-generated)",
  client: "String",
  year: "Number",
  duration: "String",
  role: "String",
  team_size: "Number",
  sector: "Reference (Sector)",
  categories: "Reference (Category, multiple)",
  skills: "Reference (Skill, multiple)",
  challenge: "Rich Text",
  approach: "Rich Text",
  outcomes: "Component (Outcomes)",
  assets: "Media (multiple)",
  featured_image: "Media",
  featured: "Boolean",
  status: "Enumeration (draft, published, archived)",
  metadata: "JSON"
}
```

### Outcomes Component
```javascript
{
  metrics: "String",
  business_impact: "Rich Text",
  awards: "Reference (Award, multiple)",
  testimonials: "Component (Testimonial, multiple)"
}
```

## 🛠️ Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Strapi CMS with PostgreSQL
- Create content models
- Import existing project data
- Basic admin interface setup

### Phase 2: Integration (Week 3-4)
- Connect CMS to Next.js frontend
- Integrate with 3D globe (projects as environments)
- Dynamic routing for project pages
- Search and filtering

### Phase 3: Enhancement (Week 5-6)
- Advanced admin features
- Asset optimization
- SEO optimization
- Performance tuning

## 🔧 Development Setup

### CMS Configuration
```javascript
// strapi/api/project/models/project.settings.json
{
  "kind": "collectionType",
  "collectionName": "projects",
  "info": {
    "name": "project",
    "description": "Portfolio project case studies"
  },
  "options": {
    "increments": true,
    "timestamps": true,
    "draftAndPublish": true
  },
  "attributes": {
    // Model definition here
  }
}
```

### Next.js Integration
```javascript
// lib/strapi.js
import qs from 'qs'

export async function getProjects(filters = {}) {
  const query = qs.stringify({
    populate: ['categories', 'skills', 'assets', 'featured_image'],
    filters,
    sort: ['year:desc']
  })

  const res = await fetch(`${process.env.STRAPI_URL}/api/projects?${query}`)
  return res.json()
}
```

## 🎨 Admin Interface Features

- **Project CRUD**: Create, edit, delete projects
- **Asset Management**: Upload and organize images, documents
- **Content Relationships**: Link projects to skills, categories
- **Preview Mode**: Preview changes before publishing
- **Bulk Operations**: Import/export project data
- **User Roles**: Different access levels for collaboration

## 📱 Benefits for Your Workflow

1. **Visual Admin**: User-friendly interface for non-technical updates
2. **Structured Data**: Consistent project information
3. **API-Driven**: Flexible data access for different views
4. **Scalable**: Easy to add new project types or fields
5. **Backup-Friendly**: Database exports and Git integration
6. **Performance**: Static generation with dynamic updates

## 🚀 Next Steps

1. **Choose CMS Platform**: Strapi (more control) vs Sanity (better UX)
2. **Set Up Development Environment**
3. **Create First Project Entry** using existing ANZ case study
4. **Integrate with 3D Globe** (projects become globe environments)
5. **Deploy and Test**

Would you like me to start implementing Phase 1 with your existing project data?