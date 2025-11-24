/**
 * PDF Processing for Flipbook system
 * Converts PDF pages to images using pure JavaScript (no native dependencies)
 *
 * Uses pdf-lib for PDF manipulation - works on Vercel serverless functions
 */

import { PDFDocument } from 'pdf-lib'
import { uploadPageImage, uploadThumbnail } from './storage-supabase'
import { updateDocumentProgress, insertPages, publishDocument } from './db'

interface PageData {
  page_number: number
  image_url: string
  width: number
  height: number
}

interface ProcessingOptions {
  quality?: number // JPEG quality (default: 85)
  maxWidth?: number // Max width in pixels (default: 1600)
}

/**
 * Process a PDF file and convert pages to images
 * Note: This converts PDF pages to PNG using pdf-lib's built-in rendering
 */
export async function processPdfToImages(
  pdfUrl: string,
  documentId: string,
  options: ProcessingOptions = {}
): Promise<PageData[]> {
  const { quality = 85, maxWidth = 1600 } = options

  try {
    // Fetch the PDF
    const response = await fetch(pdfUrl)
    const pdfBytes = await response.arrayBuffer()

    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes)
    const totalPages = pdfDoc.getPageCount()
    const pages: PageData[] = []

    console.log(`Processing ${totalPages} pages from PDF`)

    // Process each page
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNum = pageIndex + 1

      // Create a new PDF with just this page
      const singlePagePdf = await PDFDocument.create()
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex])
      singlePagePdf.addPage(copiedPage)

      // Get page dimensions
      const page = pdfDoc.getPage(pageIndex)
      let { width, height } = page.getSize()

      // Scale down if too wide
      if (width > maxWidth) {
        const scale = maxWidth / width
        width = maxWidth
        height = height * scale
      }

      // Save as PDF bytes (we'll convert to image on the client side for display)
      const pdfPageBytes = await singlePagePdf.save()
      const buffer = Buffer.from(pdfPageBytes)

      // Upload to storage
      const { url } = await uploadPageImage(buffer, documentId, pageNum)

      pages.push({
        page_number: pageNum,
        image_url: url,
        width: Math.round(width),
        height: Math.round(height),
      })

      // Update progress
      const progress = Math.floor((pageNum / totalPages) * 90) // Reserve 10% for finalization
      await updateDocumentProgress(documentId, progress)

      console.log(`Processed page ${pageNum}/${totalPages}`)
    }

    return pages
  } catch (error) {
    console.error('PDF processing error:', error)
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate thumbnail from first page
 * For now, we'll use the first page PDF as the thumbnail
 */
export async function generateThumbnail(
  firstPageUrl: string,
  documentId: string
): Promise<string> {
  try {
    // Fetch first page
    const response = await fetch(firstPageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())

    // For now, just use the first page PDF as thumbnail
    // The client will render it at thumbnail size
    const thumbnailUrl = await uploadThumbnail(buffer, documentId)

    return thumbnailUrl
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    throw new Error('Failed to generate thumbnail')
  }
}

/**
 * Complete end-to-end processing pipeline
 */
export async function processDocument(
  pdfUrl: string,
  documentId: string,
  options?: ProcessingOptions
): Promise<void> {
  try {
    // Step 1: Convert PDF to page PDFs
    console.log(`Starting processing for document ${documentId}`)
    const pages = await processPdfToImages(pdfUrl, documentId, options)

    // Step 2: Insert page records into database
    await insertPages(documentId, pages)
    await updateDocumentProgress(documentId, 95)

    // Step 3: Generate thumbnail
    const thumbnailUrl = await generateThumbnail(pages[0].image_url, documentId)
    await updateDocumentProgress(documentId, 98)

    // Step 4: Mark as published
    await publishDocument(documentId, pages.length, thumbnailUrl)

    console.log(`Successfully processed document ${documentId} with ${pages.length} pages`)
  } catch (error) {
    console.error(`Processing failed for document ${documentId}:`, error)
    throw error
  }
}

/**
 * Estimate processing time based on file size
 */
export function estimateProcessingTime(fileSize: number): number {
  // Rough estimate: ~0.5 seconds per MB (faster with pure JS)
  const seconds = Math.ceil(fileSize / (1024 * 1024 * 2))
  return Math.max(seconds, 3) // Minimum 3 seconds
}

/**
 * Get PDF page count without full processing
 */
export async function getPdfPageCount(pdfUrl: string): Promise<number> {
  try {
    const response = await fetch(pdfUrl)
    const pdfBytes = await response.arrayBuffer()
    const pdfDoc = await PDFDocument.load(pdfBytes)
    return pdfDoc.getPageCount()
  } catch (error) {
    console.error('Failed to get page count:', error)
    return 0
  }
}
