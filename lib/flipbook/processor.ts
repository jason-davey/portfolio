/**
 * PDF Processing for Flipbook system
 * Converts PDF pages to high-quality WebP images
 */

import * as pdfjsLib from 'pdfjs-dist'
import { createCanvas } from 'canvas'
import sharp from 'sharp'
// Use local storage for development (switch to './storage' for production with Vercel Blob)
import { uploadPageImage, uploadThumbnail } from './storage-supabase'
import { updateDocumentProgress, insertPages, publishDocument } from './db'

// Configure pdf.js worker
// Note: This runs on server-side only, worker is configured lazily on first use

interface PageData {
  page_number: number
  image_url: string
  width: number
  height: number
}

interface ProcessingOptions {
  scale?: number // DPI multiplier (default: 2 for retina)
  quality?: number // WebP quality (default: 85)
  maxWidth?: number // Max width in pixels (default: 1600)
}

/**
 * Process a PDF file and convert to images
 */
export async function processPdfToImages(
  pdfUrl: string,
  documentId: string,
  options: ProcessingOptions = {}
): Promise<PageData[]> {
  const { scale = 2, quality = 85, maxWidth = 1600 } = options

  try {
    // Configure worker for server-side
    if (typeof window === 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      // Use legacy worker path for Node.js environment
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.min.mjs'
    }

    // Load PDF
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    const pdf = await loadingTask.promise

    const totalPages = pdf.numPages
    const pages: PageData[] = []

    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum)

      // Calculate viewport
      const viewport = page.getViewport({ scale })

      // Adjust scale if page is too wide
      let finalScale = scale
      if (viewport.width > maxWidth) {
        finalScale = (maxWidth / viewport.width) * scale
      }

      const finalViewport = page.getViewport({ scale: finalScale })

      // Create canvas
      const canvas = createCanvas(finalViewport.width, finalViewport.height)
      const context = canvas.getContext('2d')

      // Render PDF page to canvas
      await page.render({
        canvasContext: context as any,
        viewport: finalViewport,
        canvas: canvas as any,
      }).promise

      // Convert to buffer
      const pngBuffer = canvas.toBuffer('image/png')

      // Optimize with Sharp (convert to WebP)
      const webpBuffer = await sharp(pngBuffer)
        .webp({ quality })
        .toBuffer()

      // Upload to storage
      const { url } = await uploadPageImage(webpBuffer, documentId, pageNum)

      // Get image dimensions
      const metadata = await sharp(webpBuffer).metadata()

      pages.push({
        page_number: pageNum,
        image_url: url,
        width: metadata.width || finalViewport.width,
        height: metadata.height || finalViewport.height,
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
 */
export async function generateThumbnail(
  firstPageUrl: string,
  documentId: string
): Promise<string> {
  try {
    // Fetch first page image
    const response = await fetch(firstPageUrl)
    const buffer = Buffer.from(await response.arrayBuffer())

    // Generate thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 560, {
        fit: 'cover',
        position: 'top',
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Upload thumbnail
    const thumbnailUrl = await uploadThumbnail(thumbnailBuffer, documentId)

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
    // Step 1: Convert PDF to images
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
  // Rough estimate: ~1 second per MB
  const seconds = Math.ceil(fileSize / (1024 * 1024))
  return Math.max(seconds, 5) // Minimum 5 seconds
}

/**
 * Get PDF page count without full processing
 */
export async function getPdfPageCount(pdfUrl: string): Promise<number> {
  try {
    const loadingTask = pdfjsLib.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    return pdf.numPages
  } catch (error) {
    console.error('Failed to get page count:', error)
    return 0
  }
}
