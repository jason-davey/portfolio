-- Flipbook System Database Schema
-- MVP Version: PDF documents with page storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE flipbook_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic info
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- File references
  original_file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  total_pages INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT,

  -- Status
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'published', 'draft', 'error')),
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  error_message TEXT,

  -- Optional project relationship (for portfolio integration)
  project_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Document pages table
CREATE TABLE flipbook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES flipbook_documents(id) ON DELETE CASCADE,

  -- Page info
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,

  -- For future OCR/search features
  extracted_text TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(document_id, page_number)
);

-- Indexes for performance
CREATE INDEX idx_flipbook_documents_status ON flipbook_documents(status);
CREATE INDEX idx_flipbook_documents_slug ON flipbook_documents(slug);
CREATE INDEX idx_flipbook_documents_published_at ON flipbook_documents(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_flipbook_pages_document_id ON flipbook_pages(document_id, page_number);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flipbook_documents_updated_at
  BEFORE UPDATE ON flipbook_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-publish when processing completes
CREATE OR REPLACE FUNCTION auto_publish_document()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_published_at
  BEFORE UPDATE ON flipbook_documents
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION auto_publish_document();

-- Helpful queries/views

-- Get document with pages
CREATE OR REPLACE VIEW flipbook_documents_with_pages AS
SELECT
  d.*,
  json_agg(
    json_build_object(
      'id', p.id,
      'page_number', p.page_number,
      'image_url', p.image_url,
      'width', p.width,
      'height', p.height
    ) ORDER BY p.page_number
  ) as pages
FROM flipbook_documents d
LEFT JOIN flipbook_pages p ON p.document_id = d.id
GROUP BY d.id;

-- Row Level Security (ready for multi-tenant SaaS)
ALTER TABLE flipbook_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flipbook_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published documents
CREATE POLICY "Public can view published documents"
  ON flipbook_documents
  FOR SELECT
  USING (status = 'published');

-- Policy: Public can view pages of published documents
CREATE POLICY "Public can view published pages"
  ON flipbook_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM flipbook_documents
      WHERE id = flipbook_pages.document_id
      AND status = 'published'
    )
  );

-- Policy: Admins can do everything (for MVP, replace with proper auth later)
-- Note: This requires setting up service role or admin role
CREATE POLICY "Service role can manage documents"
  ON flipbook_documents
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage pages"
  ON flipbook_pages
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Sample data for testing
INSERT INTO flipbook_documents (
  title,
  slug,
  description,
  original_file_url,
  status,
  total_pages
) VALUES (
  'Sample Portfolio Case Study',
  'sample-case-study',
  'A sample document to test the flipbook functionality',
  'https://example.com/sample.pdf',
  'draft',
  0
);

COMMENT ON TABLE flipbook_documents IS 'Stores flipbook document metadata';
COMMENT ON TABLE flipbook_pages IS 'Stores individual page images for each document';
COMMENT ON COLUMN flipbook_documents.status IS 'processing: converting PDF, published: ready to view, draft: not yet processed, error: processing failed';
COMMENT ON COLUMN flipbook_documents.processing_progress IS 'Percentage complete (0-100) during PDF processing';
