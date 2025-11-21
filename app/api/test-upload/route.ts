import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  console.log('✅ TEST ROUTE REACHED!')

  try {
    // Try to get content-length header
    const contentLength = request.headers.get('content-length')
    console.log('📦 Content-Length:', contentLength)

    // Try reading just a small chunk first
    const text = await request.text()
    console.log('📄 Body length:', text.length)

    return NextResponse.json({
      success: true,
      bodyLength: text.length,
      contentLength
    })
  } catch (error) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
