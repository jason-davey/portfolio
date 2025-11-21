/**
 * API Route: Trigger PDF processing
 * POST /api/flipbooks/process
 */

import { NextRequest, NextResponse } from 'next/server'
import { processDocument } from '@/lib/flipbook/processor'
import { getDocumentById } from '@/lib/flipbook/db'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Get document
    const document = await getDocumentById(documentId)
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Start processing (don't await - respond immediately)
    console.log('🔄 Starting PDF processing for:', documentId)
    processDocument(document.original_file_url, documentId)

    return NextResponse.json({
      success: true,
      message: 'Processing started'
    })
  } catch (error) {
    console.error('Process trigger error:', error)
    return NextResponse.json(
      { error: 'Failed to trigger processing' },
      { status: 500 }
    )
  }
}
