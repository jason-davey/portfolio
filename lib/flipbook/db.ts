/**
 * Database operations for Flipbook system
 * Using Supabase client for PostgreSQL operations
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface FlipbookDocument {
  id: string
  title: string
  slug: string
  description: string | null
  original_file_url: string
  thumbnail_url: string | null
  total_pages: number
  file_size: number | null
  status: 'processing' | 'published' | 'draft' | 'error'
  processing_progress: number
  error_message: string | null
  project_id: string | null
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface FlipbookPage {
  id: string
  document_id: string
  page_number: number
  image_url: string
  width: number
  height: number
  extracted_text: string | null
  created_at: string
}

export interface DocumentWithPages extends FlipbookDocument {
  pages: FlipbookPage[]
}

/**
 * Create a new document record
 */
export async function createDocument(data: {
  title: string
  slug: string
  description?: string
  original_file_url: string
  file_size?: number
  project_id?: string
}): Promise<FlipbookDocument> {
  const { data: document, error } = await supabase
    .from('flipbook_documents')
    .insert([{
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      original_file_url: data.original_file_url,
      file_size: data.file_size || null,
      project_id: data.project_id || null,
      status: 'processing',
      processing_progress: 0,
    }])
    .select()
    .single()

  if (error) throw new Error(`Failed to create document: ${error.message}`)
  return document
}

/**
 * Update document processing progress
 */
export async function updateDocumentProgress(
  documentId: string,
  progress: number
): Promise<void> {
  const { error } = await supabase
    .from('flipbook_documents')
    .update({ processing_progress: progress })
    .eq('id', documentId)

  if (error) throw new Error(`Failed to update progress: ${error.message}`)
}

/**
 * Mark document as completed (published)
 */
export async function publishDocument(
  documentId: string,
  totalPages: number,
  thumbnailUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('flipbook_documents')
    .update({
      status: 'published',
      processing_progress: 100,
      total_pages: totalPages,
      thumbnail_url: thumbnailUrl,
      published_at: new Date().toISOString(),
    })
    .eq('id', documentId)

  if (error) throw new Error(`Failed to publish document: ${error.message}`)
}

/**
 * Mark document as failed
 */
export async function markDocumentError(
  documentId: string,
  errorMessage: string
): Promise<void> {
  const { error } = await supabase
    .from('flipbook_documents')
    .update({
      status: 'error',
      error_message: errorMessage,
    })
    .eq('id', documentId)

  if (error) throw new Error(`Failed to mark error: ${error.message}`)
}

/**
 * Insert page records for a document
 */
export async function insertPages(
  documentId: string,
  pages: Array<{
    page_number: number
    image_url: string
    width: number
    height: number
  }>
): Promise<void> {
  const pageData = pages.map(page => ({
    document_id: documentId,
    ...page,
  }))

  const { error } = await supabase
    .from('flipbook_pages')
    .insert(pageData)

  if (error) throw new Error(`Failed to insert pages: ${error.message}`)
}

/**
 * Get a single document with its pages by slug
 */
export async function getDocumentBySlug(slug: string): Promise<DocumentWithPages | null> {
  const { data: document, error: docError } = await supabase
    .from('flipbook_documents')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (docError || !document) return null

  const { data: pages, error: pagesError } = await supabase
    .from('flipbook_pages')
    .select('*')
    .eq('document_id', document.id)
    .order('page_number', { ascending: true })

  if (pagesError) throw new Error(`Failed to fetch pages: ${pagesError.message}`)

  return {
    ...document,
    pages: pages || [],
  }
}

/**
 * Get a single document by ID (admin access)
 */
export async function getDocumentById(id: string): Promise<DocumentWithPages | null> {
  const { data: document, error: docError } = await supabase
    .from('flipbook_documents')
    .select('*')
    .eq('id', id)
    .single()

  if (docError || !document) return null

  const { data: pages, error: pagesError } = await supabase
    .from('flipbook_pages')
    .select('*')
    .eq('document_id', document.id)
    .order('page_number', { ascending: true })

  if (pagesError) return { ...document, pages: [] }

  return {
    ...document,
    pages: pages || [],
  }
}

/**
 * List all documents (admin)
 */
export async function listDocuments(options?: {
  status?: FlipbookDocument['status']
  limit?: number
  offset?: number
}): Promise<FlipbookDocument[]> {
  let query = supabase
    .from('flipbook_documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw new Error(`Failed to list documents: ${error.message}`)
  return data || []
}

/**
 * Delete a document and all its pages
 */
export async function deleteDocument(id: string): Promise<void> {
  // Pages will be deleted automatically due to CASCADE
  const { error } = await supabase
    .from('flipbook_documents')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete document: ${error.message}`)
}

/**
 * Generate a unique slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Check if slug is available
 */
export async function isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('flipbook_documents')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) return false
  return !data || data.length === 0
}

/**
 * Generate unique slug by adding number suffix if needed
 */
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(title)
  let counter = 1

  while (!(await isSlugAvailable(slug, excludeId))) {
    slug = `${generateSlug(title)}-${counter}`
    counter++
  }

  return slug
}
