-- Supabase Portfolio Schema Setup
-- Optimized for Supabase with RLS policies and Edge Functions

-- ================================
-- ENABLE EXTENSIONS
-- ================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- MAIN PROJECTS TABLE
-- ================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  client TEXT NOT NULL,
  year INTEGER NOT NULL,
  duration TEXT,

  -- Role & Team
  role TEXT NOT NULL,
  team_size INTEGER,
  team_structure JSONB DEFAULT '{}',
  budget_scale TEXT CHECK (budget_scale IN ('startup', 'mid-market', 'enterprise')),

  -- Classification
  sector TEXT,
  project_type TEXT,
  methodologies TEXT[] DEFAULT '{}',

  -- Core Content (Storytelling Framework)
  content JSONB DEFAULT '{
    "hook": {
      "elevator_pitch": "",
      "impact_headline": "",
      "key_visual": ""
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
  }'::jsonb,

  -- Metrics
  metrics JSONB DEFAULT '{
    "quantitative": {},
    "qualitative": {}
  }'::jsonb,

  -- Media & Assets
  featured_image TEXT,
  hero_video TEXT,
  assets JSONB DEFAULT '{"process_images": [], "before_after": [], "deliverable_samples": []}'::jsonb,

  -- Location
  location JSONB DEFAULT '{"city": "", "country": "", "coordinates": {"lat": null, "lng": null}}'::jsonb,

  -- Organization
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  confidentiality TEXT DEFAULT 'public' CHECK (confidentiality IN ('public', 'limited', 'confidential')),
  story_priority INTEGER DEFAULT 0,
  target_audience TEXT[] DEFAULT '{}',
  demonstrates_skills TEXT[] DEFAULT '{}',

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- SUPPORTING TABLES
-- ================================

-- Skills Table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  competency_level TEXT CHECK (competency_level IN ('Practitioner', 'Expert', 'Master')),
  description TEXT,
  evidence_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Methodologies Table
CREATE TABLE methodologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  when_to_use TEXT,
  typical_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sectors Table
CREATE TABLE sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  typical_challenges TEXT[] DEFAULT '{}',
  common_approaches TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Awards Table
CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT,
  year INTEGER NOT NULL,
  description TEXT,
  impact_statement TEXT,
  media_coverage TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials Table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  stakeholder_name TEXT NOT NULL,
  stakeholder_role TEXT,
  stakeholder_company TEXT,
  relationship TEXT CHECK (relationship IN ('Client', 'Team Member', 'End User', 'Stakeholder')),
  quote TEXT NOT NULL,
  context TEXT,
  permission_level TEXT DEFAULT 'attributed' CHECK (permission_level IN ('attributed', 'anonymous', 'confidential')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- RELATIONSHIP TABLES
-- ================================

-- Project Skills (Many-to-Many)
CREATE TABLE project_skills (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, skill_id)
);

-- Project Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT, -- hex color for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE project_categories (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- ================================
-- FUNCTIONS
-- ================================

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Slug generation function
CREATE OR REPLACE FUNCTION generate_slug(title TEXT, year INTEGER, client TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            year || '-' || regexp_replace(client || '-' || title, '[^a-zA-Z0-9\s]', '', 'g'),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Auto-generate slug trigger
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.title, NEW.year, NEW.client);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_slug_trigger BEFORE INSERT OR UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- ================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE methodologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read access for published projects
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published' AND confidentiality = 'public');

-- Admin full access (you'll need to set up auth)
CREATE POLICY "Admin can do everything"
  ON projects FOR ALL
  USING (auth.role() = 'admin');

-- Similar policies for other tables
CREATE POLICY "Public read access" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read access" ON methodologies FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sectors FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);

-- Awards and testimonials follow project visibility
CREATE POLICY "Public can read public project awards"
  ON awards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = awards.project_id
    AND projects.status = 'published'
    AND projects.confidentiality = 'public'
  ));

CREATE POLICY "Public can read public project testimonials"
  ON testimonials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = testimonials.project_id
    AND projects.status = 'published'
    AND projects.confidentiality = 'public'
  ));

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_year_desc ON projects(year DESC);
CREATE INDEX idx_projects_sector ON projects(sector);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_story_priority ON projects(story_priority DESC);

-- JSONB indexes
CREATE INDEX idx_projects_location ON projects USING GIN(location);
CREATE INDEX idx_projects_content ON projects USING GIN(content);
CREATE INDEX idx_projects_metrics ON projects USING GIN(metrics);

-- Full-text search
CREATE INDEX idx_projects_search ON projects USING GIN(
  to_tsvector('english', title || ' ' || client || ' ' || COALESCE(content->>'problem'->>'challenge_statement', ''))
);

-- ================================
-- VIEWS
-- ================================

-- Portfolio Overview for Frontend
CREATE VIEW portfolio_overview AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.client,
  p.year,
  p.role,
  p.sector,
  p.featured,
  p.featured_image,
  p.content->'hook'->>'impact_headline' as impact_headline,
  p.content->'hook'->>'elevator_pitch' as elevator_pitch,
  p.metrics->'quantitative' as metrics,
  p.location,
  p.story_priority,
  p.created_at
FROM projects p
WHERE p.status = 'published' AND p.confidentiality = 'public'
ORDER BY p.story_priority DESC, p.year DESC;

-- Globe Data View (for 3D integration)
CREATE VIEW globe_data AS
SELECT
  p.id,
  p.title,
  p.client,
  p.sector,
  p.year,
  p.featured_image,
  p.location->'coordinates'->>'lat' as latitude,
  p.location->'coordinates'->>'lng' as longitude,
  p.location->>'city' as city,
  p.location->>'country' as country,
  p.content->'hook'->>'impact_headline' as impact,
  COALESCE(array_length(
    (SELECT array_agg(s.name)
     FROM project_skills ps
     JOIN skills s ON ps.skill_id = s.id
     WHERE ps.project_id = p.id), 1), 0
  ) as skill_count
FROM projects p
WHERE p.status = 'published'
  AND p.confidentiality = 'public'
  AND p.location->'coordinates'->>'lat' IS NOT NULL
  AND p.location->'coordinates'->>'lng' IS NOT NULL;

-- ================================
-- SAMPLE DATA
-- ================================

-- Insert sample skills
INSERT INTO skills (name, category, competency_level, description) VALUES
('Business Design', 'Strategic', 'Master', 'Gap analysis, process mapping, strategic roadmaps'),
('Human-Centered Design', 'Design', 'Master', 'User research, service design, experience mapping'),
('Organizational Change', 'Leadership', 'Expert', 'Change management, stakeholder alignment'),
('Design Thinking Facilitation', 'Design', 'Master', 'Workshop facilitation, co-creation sessions'),
('Stakeholder Management', 'Leadership', 'Expert', 'C-suite alignment, cross-functional collaboration');

-- Insert sample methodologies
INSERT INTO methodologies (name, category, description) VALUES
('Design Thinking', 'Research', 'Human-centered approach to innovation'),
('Lean Six Sigma', 'Implementation', 'Process improvement methodology'),
('Service Design', 'Design', 'End-to-end experience design'),
('Agile Methodology', 'Implementation', 'Iterative development approach'),
('Change Management (Kotter)', 'Implementation', '8-step organizational change process');

-- Insert sample sectors
INSERT INTO sectors (name, description, typical_challenges) VALUES
('Financial Services', 'Banking, insurance, fintech', ARRAY['Regulatory compliance', 'Digital transformation', 'Customer experience']),
('Healthcare', 'Hospitals, health tech, pharmaceuticals', ARRAY['Patient experience', 'Operational efficiency', 'Technology adoption']),
('Government', 'Public sector, civic organizations', ARRAY['Service delivery', 'Citizen engagement', 'Process modernization']),
('Technology', 'Software, hardware, digital platforms', ARRAY['Product innovation', 'User adoption', 'Scalable growth']);

-- Insert sample categories
INSERT INTO categories (name, description, color) VALUES
('Business Transformation', 'Large-scale organizational change', '#4a90e2'),
('Service Design', 'Customer experience and journey design', '#7ed321'),
('Innovation Strategy', 'New product/service development', '#f5a623'),
('Digital Transformation', 'Technology-enabled change', '#9013fe'),
('Leadership Development', 'Capability building and coaching', '#ff6b6b');

-- ================================
-- API HELPER FUNCTIONS
-- ================================

-- Function to get project with all relationships
CREATE OR REPLACE FUNCTION get_project_full(project_slug TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(project_data) INTO result
    FROM (
        SELECT
            p.*,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', s.id,
                    'name', s.name,
                    'category', s.category,
                    'competency_level', s.competency_level
                )) FILTER (WHERE s.id IS NOT NULL),
                '[]'::json
            ) as skills,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', c.id,
                    'name', c.name,
                    'color', c.color
                )) FILTER (WHERE c.id IS NOT NULL),
                '[]'::json
            ) as categories,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', a.id,
                    'name', a.name,
                    'organization', a.organization,
                    'year', a.year,
                    'description', a.description
                )) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) as awards,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'stakeholder_name', t.stakeholder_name,
                    'stakeholder_role', t.stakeholder_role,
                    'quote', t.quote,
                    'relationship', t.relationship
                )) FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) as testimonials
        FROM projects p
        LEFT JOIN project_skills ps ON p.id = ps.project_id
        LEFT JOIN skills s ON ps.skill_id = s.id
        LEFT JOIN project_categories pc ON p.id = pc.project_id
        LEFT JOIN categories c ON pc.category_id = c.id
        LEFT JOIN awards a ON p.id = a.project_id
        LEFT JOIN testimonials t ON p.id = t.project_id
        WHERE p.slug = project_slug
          AND p.status = 'published'
          AND p.confidentiality = 'public'
        GROUP BY p.id
    ) project_data;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to search projects
CREATE OR REPLACE FUNCTION search_projects(search_term TEXT)
RETURNS TABLE(
    id UUID,
    title TEXT,
    client TEXT,
    year INTEGER,
    sector TEXT,
    impact_headline TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.client,
        p.year,
        p.sector,
        p.content->'hook'->>'impact_headline' as impact_headline,
        ts_rank(
            to_tsvector('english', p.title || ' ' || p.client || ' ' || COALESCE(p.content->>'problem'->>'challenge_statement', '')),
            to_tsquery('english', search_term)
        ) as rank
    FROM projects p
    WHERE p.status = 'published'
      AND p.confidentiality = 'public'
      AND to_tsvector('english', p.title || ' ' || p.client || ' ' || COALESCE(p.content->>'problem'->>'challenge_statement', ''))
          @@ to_tsquery('english', search_term)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;