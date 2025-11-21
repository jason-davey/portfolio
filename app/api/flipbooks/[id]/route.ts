/**
 * API Routes: CRUD operations for flipbook documents
 * GET    /api/flipbooks/[id] - Get document by ID
 * PATCH  /api/flipbooks/[id] - Update document
 * DELETE /api/flipbooks/[id] - Delete document
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDocumentById, deleteDocument, supabase } from '@/lib/flipbook/db'
import { deleteDocumentFiles } from '@/lib/flipbook/storage'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * GET - Fetch document with pages
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const document = await getDocumentById(params.id)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update document metadata
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const body = await request.json()
    const { title, description, status, project_id } = body

    const updates: Record<string, any> = {}

    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (status !== undefined) {
      if (!['processing', 'published', 'draft', 'error'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        )
      }
      updates.status = status
    }
    if (project_id !== undefined) updates.project_id = project_id

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('flipbook_documents')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: data,
    })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Remove document and all associated files
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    // Get document to verify it exists
    const document = await getDocumentById(params.id)

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete from storage (Vercel Blob)
    try {
      await deleteDocumentFiles(params.id)
    } catch (storageError) {
      console.error('Failed to delete files from storage:', storageError)
      // Continue with database deletion even if storage cleanup fails
    }

    // Delete from database (this will cascade to pages)
    await deleteDocument(params.id)

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
