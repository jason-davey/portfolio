/**
 * API Route: List all flipbook documents
 * GET /api/flipbooks
 */

import { NextRequest, NextResponse } from 'next/server'
import { listDocuments } from '@/lib/flipbook/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as any
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const documents = await listDocuments({
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    return NextResponse.json({
      documents,
      total: documents.length,
    })
  } catch (error) {
    console.error('List documents error:', error)
    return NextResponse.json(
      { error: 'Failed to list documents' },
      { status: 500 }
    )
  }
}
