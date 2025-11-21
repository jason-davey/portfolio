'use server'

/**
 * Server Action: Upload and process PDF documents
 * This uses Server Actions which have a 50MB body size limit (configured in next.config)
 */

import { uploadOriginalPdf, validatePdfFile, sanitizeFilename } from '@/lib/flipbook/storage-supabase'
import { createDocument, generateUniqueSlug } from '@/lib/flipbook/db'
import { inngest } from '@/lib/inngest/client'

export async function uploadFlipbookAction(formData: FormData) {
  console.log('🔥 SERVER ACTION: uploadFlipbookAction called')

  try {
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const projectId = formData.get('project_id') as string | null

    console.log('📄 File received:', { name: file?.name, size: file?.size, title })

    // Validate inputs
    if (!file) {
      console.error('❌ No file provided')
      return {
        success: false,
        error: 'No file provided'
      }
    }

    if (!title) {
      console.error('❌ No title provided')
      return {
        success: false,
        error: 'Title is required'
      }
    }

    // Validate PDF file
    console.log('🔍 Validating PDF...')
    const validation = validatePdfFile(file)
    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.error)
      return {
        success: false,
        error: validation.error
      }
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

    // Trigger background job for PDF processing
    console.log('🔄 Triggering Inngest background job...')
    await inngest.send({
      name: 'flipbook/pdf.uploaded',
      data: {
        documentId: document.id,
        pdfUrl: originalFileUrl,
      },
    })
    console.log('✅ Background job triggered')

    // Return immediately with document info
    console.log('✅ Returning success response')
    return {
      success: true,
      document: {
        id: document.id,
        slug: document.slug,
        title: document.title,
        status: document.status,
      },
      message: 'Document uploaded and processing started',
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
