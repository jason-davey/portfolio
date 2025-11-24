-- Strategic Design Portfolio Content Model
-- Based on 2024 best practices research: IDEO, McKinsey, and industry standards
-- Optimized for narrative storytelling and business impact demonstration

-- ================================
-- REFINED PROJECTS TABLE
-- ================================

CREATE TABLE projects (
  id TEXT PRIMARY KEY,

  -- Basic Project Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration TEXT, -- e.g., "6 months", "18-month engagement"

  -- Your Role & Context
  role TEXT NOT NULL, -- "Design Director", "Lead Strategist"
  team_size INTEGER,
  team_structure JSONB, -- {internal: 3, external: 2, stakeholders: 8}
  budget_scale TEXT, -- "enterprise", "mid-market", "startup"

  -- Classification
  sector TEXT,
  project_type TEXT, -- "Transformation", "Innovation", "Service Design"
  methodologies TEXT[], -- ["Design Thinking", "Lean Six Sigma", "Agile"]

  -- Content Structure (Storytelling Framework)
  content JSONB NOT NULL DEFAULT '{
    "hook": {
      "elevator_pitch": "",
      "key_visual": "",
      "impact_headline": ""
    },
    "problem": {
      "context": "",
      "challenge_statement": "",
      "stakeholder_pain_points": [],
      "business_constraints": [],
      "why_now": ""
    },
    "opportunity": {
      "research_insights": "",
      "validation_methods": [],
      "user_needs": [],
      "business_opportunity": "",
      "strategic_alignment": ""
    },
    "approach": {
      "design_process": "",
      "methodology_rationale": "",
      "key_activities": [],
      "stakeholder_engagement": "",
      "tools_techniques": []
    },
    "solution": {
      "intervention_overview": "",
      "key_deliverables": [],
      "implementation_strategy": "",
      "change_management": "",
      "innovation_elements": []
    },
    "outcomes": {
      "immediate_results": "",
      "business_metrics": {},
      "user_impact": "",
      "organizational_change": "",
      "long_term_value": ""
    },
    "reflection": {
      "lessons_learned": "",
      "challenges_overcome": "",
      "what_worked_well": "",
      "would_do_differently": ""
    }
  }',

  -- Metrics & Value (Structured for easy querying)
  metrics JSONB DEFAULT '{
    "quantitative": {
      "efficiency_gains": "",
      "cost_savings": "",
      "revenue_impact": "",
      "user_satisfaction": "",
      "adoption_rates": ""
    },
    "qualitative": {
      "stakeholder_feedback": [],
      "culture_change": "",
      "capability_uplift": "",
      "strategic_alignment": ""
    }
  }',

  -- Assets & Media
  featured_image TEXT,
  hero_video TEXT,
  assets JSONB DEFAULT '{
    "process_images": [],
    "before_after": [],
    "deliverable_samples": [],
    "stakeholder_journey": [],
    "workshop_photos": []
  }',

  -- Geographic & Context
  location JSONB DEFAULT '{
    "city": "",
    "country": "",
    "region": "",
    "coordinates": {"lat": null, "lng": null}
  }',

  -- Status & Organization
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  confidentiality TEXT DEFAULT 'public' CHECK (confidentiality IN ('public', 'limited', 'confidential')),

  -- Portfolio Strategy
  story_priority INTEGER DEFAULT 0, -- Higher = more prominent
  target_audience TEXT[], -- ["c-suite", "hr-leaders", "design-teams"]
  demonstrates_skills TEXT[], -- Key competencies showcased

  -- SEO & Discoverability
  seo_title TEXT,
  seo_description TEXT,
  keywords TEXT[],

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- ENHANCED SUPPORTING TABLES
-- ================================

-- Design Methodologies (standardized)
CREATE TABLE methodologies (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- "Research", "Ideation", "Implementation"
  description TEXT,
  when_to_use TEXT,
  typical_duration TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skills with Competency Levels
CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT, -- "Strategic", "Design", "Leadership", "Technical"
  competency_level TEXT, -- "Practitioner", "Expert", "Master" (teaches others)
  description TEXT,
  evidence_types TEXT[], -- What demonstrates this skill
  created_at TIMESTAMP DEFAULT NOW()
);

-- Client Types/Sectors (standardized)
CREATE TABLE sectors (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  typical_challenges TEXT[],
  common_approaches TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Awards & Recognition
CREATE TABLE awards (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT,
  year INTEGER NOT NULL,
  description TEXT,
  impact_statement TEXT,
  media_coverage TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Testimonials & Stakeholder Feedback
CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  stakeholder_name TEXT NOT NULL,
  stakeholder_role TEXT,
  stakeholder_company TEXT,
  relationship TEXT, -- "Client", "Team Member", "End User"
  quote TEXT NOT NULL,
  context TEXT, -- When/why this was said
  permission_level TEXT DEFAULT 'attributed', -- "attributed", "anonymous", "confidential"
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- STORYTELLING SUPPORT TABLES
-- ================================

-- Story Elements (for narrative construction)
CREATE TABLE story_elements (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL, -- "hook", "conflict", "resolution", "transformation"
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  visual_assets TEXT[],
  sequence_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Process Documentation (design journey)
CREATE TABLE process_steps (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- "Discover", "Define", "Ideate", "Prototype", "Test", "Implement"
  step_name TEXT NOT NULL,
  description TEXT NOT NULL,
  methods_used TEXT[],
  deliverables TEXT[],
  insights_gained TEXT[],
  duration TEXT,
  sequence_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- CONTENT TEMPLATES & EXAMPLES
-- ================================

-- Insert sample methodologies
INSERT INTO methodologies (id, name, category, description, when_to_use) VALUES
('design-thinking', 'Design Thinking', 'Research', 'Human-centered approach to innovation', 'Complex problems with unclear solutions'),
('lean-six-sigma', 'Lean Six Sigma', 'Implementation', 'Process improvement methodology', 'Operational efficiency challenges'),
('service-design', 'Service Design', 'Design', 'End-to-end experience design', 'Multi-touchpoint customer journeys'),
('change-management', 'Change Management', 'Implementation', 'Kotter 8-step change process', 'Organizational transformation'),
('stakeholder-mapping', 'Stakeholder Mapping', 'Research', 'Identify and analyze key stakeholders', 'Complex organizational projects');

-- Insert sample skills with competency levels
INSERT INTO skills (id, name, category, competency_level) VALUES
('business-design', 'Business Design', 'Strategic', 'Master'),
('human-centered-design', 'Human-Centered Design', 'Design', 'Master'),
('organizational-change', 'Organizational Change', 'Leadership', 'Expert'),
('stakeholder-management', 'Stakeholder Management', 'Leadership', 'Expert'),
('design-thinking-facilitation', 'Design Thinking Facilitation', 'Design', 'Master');

-- Insert sample sectors
INSERT INTO sectors (id, name, typical_challenges) VALUES
('financial-services', 'Financial Services', ARRAY['Regulatory compliance', 'Digital transformation', 'Customer experience']),
('healthcare', 'Healthcare', ARRAY['Patient experience', 'Operational efficiency', 'Technology adoption']),
('government', 'Government', ARRAY['Service delivery', 'Citizen engagement', 'Process modernization']),
('technology', 'Technology', ARRAY['Product innovation', 'User adoption', 'Scalable growth']);

-- ================================
-- EXAMPLE PROJECT CONTENT STRUCTURE
-- ================================

/*
Example content JSONB structure based on research:

{
  "hook": {
    "elevator_pitch": "Transformed ANZ's Business Services Unit operational structure, achieving 20% efficiency gains while improving commercial performance through human-centered organizational redesign.",
    "key_visual": "/assets/anz-transformation-hero.jpg",
    "impact_headline": "20% increase in decision-making efficiency"
  },

  "problem": {
    "context": "ANZ Bank's Business Services Unit was experiencing operational inefficiencies and decision-making bottlenecks that were impacting commercial performance.",
    "challenge_statement": "How might we redesign operational structures to improve decision-making speed while maintaining governance and accountability?",
    "stakeholder_pain_points": [
      "Senior leadership: Slow response to market opportunities",
      "Middle management: Unclear decision rights and accountability",
      "Front-line staff: Limited autonomy and empowerment"
    ],
    "business_constraints": [
      "Regulatory requirements",
      "Existing technology systems",
      "Union considerations",
      "3-month implementation window"
    ],
    "why_now": "Competitive pressure and regulatory changes requiring faster market response"
  },

  "opportunity": {
    "research_insights": "Stakeholder interviews revealed 60% of decisions required multiple approval layers, with average decision time of 3.2 weeks",
    "validation_methods": ["Stakeholder interviews", "Process mapping", "Decision audit"],
    "user_needs": [
      "Clear decision authority",
      "Streamlined approval processes",
      "Better information access"
    ],
    "business_opportunity": "Potential for significant efficiency gains and improved market responsiveness",
    "strategic_alignment": "Aligned with ANZ's digital transformation and customer-centricity goals"
  },

  "approach": {
    "design_process": "Applied human-centered design methodology with co-creation workshops and iterative prototyping of organizational structures",
    "methodology_rationale": "Used design thinking to ensure solutions met both business needs and user experience requirements",
    "key_activities": [
      "Stakeholder journey mapping",
      "Decision rights workshops",
      "Process redesign sessions",
      "Prototype testing with pilot groups"
    ],
    "stakeholder_engagement": "Engaged 45+ stakeholders across 6 levels of the organization through workshops, interviews, and co-creation sessions",
    "tools_techniques": ["Service blueprinting", "Stakeholder mapping", "Process optimization", "Change readiness assessment"]
  },

  "solution": {
    "intervention_overview": "Redesigned operational structure with clear decision rights, streamlined approval processes, and enhanced information flow",
    "key_deliverables": [
      "New organizational structure",
      "Decision rights matrix",
      "Process documentation",
      "Change management plan",
      "Training materials"
    ],
    "implementation_strategy": "Phased rollout with pilot groups, feedback loops, and iterative refinement",
    "change_management": "Comprehensive change strategy including communication plan, training, and support systems",
    "innovation_elements": ["Self-organizing team structures", "Decision dashboards", "Feedback mechanisms"]
  },

  "outcomes": {
    "immediate_results": "Successful implementation within 3-month window with high stakeholder satisfaction",
    "business_metrics": {
      "efficiency_gain": "20% increase in decision-making speed",
      "satisfaction_score": "85% stakeholder satisfaction",
      "adoption_rate": "95% process adoption within 6 months"
    },
    "user_impact": "Improved job satisfaction and empowerment across all levels",
    "organizational_change": "Cultural shift toward collaboration and accountability",
    "long_term_value": "Sustained improvements in agility and market responsiveness"
  },

  "reflection": {
    "lessons_learned": "Co-creation approach was critical for buy-in and sustainable change",
    "challenges_overcome": "Navigated competing stakeholder interests through transparent facilitation",
    "what_worked_well": "Design thinking methodology resonated with business stakeholders",
    "would_do_differently": "Would have involved IT earlier in the process for systems integration"
  }
}
*/

-- ================================
-- VIEWS FOR EASY QUERYING
-- ================================

-- Portfolio Overview View
CREATE VIEW portfolio_overview AS
SELECT
  p.id,
  p.title,
  p.client,
  p.year,
  p.role,
  p.sector,
  p.featured,
  p.content->>'hook'->>'impact_headline' as impact_headline,
  p.metrics->'quantitative' as key_metrics,
  array_agg(DISTINCT s.name) as skills,
  array_agg(DISTINCT c.name) as categories
FROM projects p
LEFT JOIN project_skills ps ON p.id = ps.project_id
LEFT JOIN skills s ON ps.skill_id = s.id
LEFT JOIN project_categories pc ON p.id = pc.project_id
LEFT JOIN categories c ON pc.category_id = c.id
WHERE p.status = 'published'
GROUP BY p.id, p.title, p.client, p.year, p.role, p.sector, p.featured, p.content, p.metrics;

-- Storytelling Data View
CREATE VIEW project_stories AS
SELECT
  p.id,
  p.title,
  p.content->>'hook' as hook,
  p.content->>'problem' as problem,
  p.content->>'opportunity' as opportunity,
  p.content->>'approach' as approach,
  p.content->>'solution' as solution,
  p.content->>'outcomes' as outcomes,
  p.content->>'reflection' as reflection
FROM projects p
WHERE p.status = 'published';

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Core search indexes
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_year_desc ON projects(year DESC);
CREATE INDEX idx_projects_sector ON projects(sector);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_story_priority ON projects(story_priority DESC);

-- Content search index
CREATE INDEX idx_projects_content_search ON projects USING GIN(
  to_tsvector('english',
    title || ' ' ||
    client || ' ' ||
    COALESCE(content->>'problem'->>'challenge_statement', '') || ' ' ||
    COALESCE(content->>'solution'->>'intervention_overview', '')
  )
);

-- Geographic search
CREATE INDEX idx_projects_location ON projects USING GIN(location);

-- Skills and methodology search
CREATE INDEX idx_projects_skills ON projects USING GIN(demonstrates_skills);
CREATE INDEX idx_projects_methodologies ON projects USING GIN(methodologies);