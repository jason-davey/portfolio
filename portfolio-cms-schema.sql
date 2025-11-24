-- Portfolio CMS Schema (Based on your A/B Testing Platform Architecture)
-- Adapts your existing patterns for portfolio management

-- ================================
-- CORE PORTFOLIO TABLES
-- ================================

-- Projects Table (similar to your landing_pages table)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration TEXT,
  role TEXT NOT NULL,
  team_size INTEGER,
  sector TEXT,

  -- Content (using JSONB like your system)
  content JSONB NOT NULL DEFAULT '{}', -- challenge, approach, outcomes, etc.
  metadata JSONB NOT NULL DEFAULT '{}', -- flexible additional data

  -- Design & Assets
  featured_image TEXT, -- URL to main project image
  assets JSONB DEFAULT '[]', -- array of asset URLs and descriptions

  -- Status & Organization
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0, -- for sorting

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Skills Table (master list)
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- e.g., 'Design', 'Strategy', 'Leadership'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories Table (project types)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT, -- hex color for UI
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sectors Table (industries)
CREATE TABLE sectors (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- RELATIONSHIP TABLES
-- ================================

-- Project Skills (many-to-many)
CREATE TABLE project_skills (
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  skill_id TEXT REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Project Categories (many-to-many)
CREATE TABLE project_categories (
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- ================================
-- ADDITIONAL TABLES
-- ================================

-- Awards Table
CREATE TABLE awards (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  year INTEGER NOT NULL,
  category TEXT,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project Assets Table (for better asset management)
CREATE TABLE project_assets (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image', 'document', 'video', 'presentation'
  description TEXT,
  size_bytes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Search and filtering indexes
CREATE INDEX idx_projects_year ON projects(year DESC);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_client ON projects(client);
CREATE INDEX idx_projects_sector ON projects(sector);
CREATE INDEX idx_projects_slug ON projects(slug);

-- Full-text search index
CREATE INDEX idx_projects_search ON projects USING GIN(
  to_tsvector('english', title || ' ' || client || ' ' || COALESCE(content->>'challenge', '') || ' ' || COALESCE(content->>'approach', ''))
);

-- ================================
-- SAMPLE DATA STRUCTURE
-- ================================

-- Example project content structure (JSONB)
/*
{
  "challenge": "Brief description of the business challenge",
  "approach": "High-level methodology and interventions",
  "outcomes": {
    "metrics": "20% increase in decision-making efficiency",
    "business_impact": "Improved commercial performance",
    "recognition": ["Industry awards", "Media coverage"]
  },
  "process": {
    "discovery": "Research and analysis phase details",
    "design": "Design thinking and methodology",
    "implementation": "Rollout and change management",
    "measurement": "Success metrics and evaluation"
  },
  "reflections": {
    "lessons_learned": "Key insights from the project",
    "challenges": "Obstacles encountered and how they were overcome",
    "innovations": "Novel approaches or breakthroughs achieved"
  }
}
*/

-- Example metadata structure (JSONB)
/*
{
  "location": "Sydney, Australia",
  "budget_range": "enterprise",
  "team_structure": {
    "internal": 3,
    "external": 2,
    "stakeholders": 8
  },
  "methodologies": ["Design Thinking", "Agile", "Lean Six Sigma"],
  "tools_used": ["Figma", "Miro", "Slack"],
  "project_phases": ["Discovery", "Design", "Implementation", "Measurement"],
  "success_criteria": ["Efficiency gains", "User satisfaction", "Business impact"]
}
*/