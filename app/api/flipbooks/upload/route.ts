/**
 * API Route: Upload and process PDF documents
 * POST /api/flipbooks/upload
 */

import { NextRequest, NextResponse } from 'next/server'
// Use Supabase Storage (switch to '@/lib/flipbook/storage' for Vercel Blob)
import { uploadOriginalPdf, validatePdfFile, sanitizeFilename } from '@/lib/flipbook/storage-supabase'
import { createDocument, generateUniqueSlug, markDocumentError } from '@/lib/flipbook/db'
import { processDocument } from '@/lib/flipbook/processor'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for processing

export async function POST(request: NextRequest) {
  console.log('🔥 POST /api/flipbooks/upload - Handler ENTERED')
  console.log('🔥 Request method:', request.method)
  console.log('🔥 Request headers:', Object.fromEntries(request.headers.entries()))

  try {
    console.log('📥 Upload API: Receiving request...')
    console.log('📥 About to parse formData...')
    const formData = await request.formData()
    console.log('📥 FormData parsed successfully')
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const projectId = formData.get('project_id') as string | null

    console.log('📄 File received:', { name: file?.name, size: file?.size, title })

    // Validate inputs
    if (!file) {
      console.error('❌ No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!title) {
      console.error('❌ No title provided')
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Validate PDF file
    console.log('🔍 Validating PDF...')
    const validation = validatePdfFile(file)
    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Upload original file
    console.log('📤 Uploading original file...')
    const sanitizedFilename = sanitizeFilename(file.name)
    const originalFileUrl = await uploadOriginalPdf(file, sanitizedFilename)
    console.log('✅ File uploaded:', originalFileUrl)

    // Generate unique slug
    console.log('🔤 Generating slug...')
    const slug = await generateUniqueSlug(title)
    console.log('✅ Slug generated:', slug)

    // Create database record
    console.log('💾 Creating database record...')
    const document = await createDocument({
      title,
      slug,
      description: description || undefined,
      original_file_url: originalFileUrl,
      file_size: file.size,
      project_id: projectId || undefined,
    })
    console.log('✅ Database record created:', document.id)

    // Start async processing (don't await - respond immediately)
    console.log('🔄 Starting async processing...')
    processDocument(originalFileUrl, document.id)
      .catch(async (error) => {
        console.error('❌ Document processing failed:', error)
        await markDocumentError(
          document.id,
          error instanceof Error ? error.message : 'Unknown processing error'
        )
      })

    // Return immediately with document info
    console.log('✅ Returning success response')
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        slug: document.slug,
        title: document.title,
        status: document.status,
      },
      message: 'Document uploaded and processing started',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Get upload status
 * Useful for checking if processing is complete
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const documentId = searchParams.get('id')

  if (!documentId) {
    return NextResponse.json(
      { error: 'Document ID required' },
      { status: 400 }
    )
  }

  try {
    const { getDocumentById } = await import('@/lib/flipbook/db')
    const document = await getDocumentById(documentId)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: document.id,
      status: document.status,
      progress: document.processing_progress,
      total_pages: document.total_pages,
      error_message: document.error_message,
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
