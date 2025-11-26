/**
 * PDF Processing for Flipbook system
 * Converts PDF pages to WebP images using server-side rendering
 *
 * Uses @napi-rs/canvas and pdfjs-dist for high-quality PDF rendering
 */

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from '@napi-rs/canvas'
import sharp from 'sharp'
import { uploadPageImage, uploadThumbnail } from './storage-supabase'
import { updateDocumentProgress, insertPages, publishDocument } from './db'

// Configure PDF.js - disable worker for server-side rendering
pdfjs.GlobalWorkerOptions.workerSrc = ''

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
 * Process a PDF file and convert pages to WebP images
 * Uses server-side canvas rendering for high-quality output
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

    // Load PDF document with pdfjs
    const loadingTask = pdfjs.getDocument({
      data: pdfBytes,
      useSystemFonts: true,
    })
    const pdfDoc = await loadingTask.promise
    const totalPages = pdfDoc.numPages
    const pages: PageData[] = []

    console.log(`Processing ${totalPages} pages from PDF`)

    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // Get the page
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // 2x scale for better quality

      // Calculate scaled dimensions
      let width = viewport.width
      let height = viewport.height
      let scale = 2.0

      // Scale down if too wide
      if (width > maxWidth * 2) {
        scale = (maxWidth * 2) / viewport.width
        const scaledViewport = page.getViewport({ scale })
        width = scaledViewport.width
        height = scaledViewport.height
      }

      // Create canvas with @napi-rs/canvas
      const canvas = createCanvas(Math.round(width), Math.round(height))
      const context = canvas.getContext('2d')

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: page.getViewport({ scale }),
        background: 'white',
      }

      await page.render(renderContext as any).promise

      // Convert canvas to PNG buffer
      const pngBuffer = await canvas.encode('png')

      // Convert PNG to WebP using sharp for better compression
      const webpBuffer = await sharp(pngBuffer)
        .webp({ quality })
        .toBuffer()

      // Upload to storage
      const { url } = await uploadPageImage(webpBuffer, documentId, pageNum)

      pages.push({
        page_number: pageNum,
        image_url: url,
        width: Math.round(width / 2), // Return original dimensions (not 2x)
        height: Math.round(height / 2),
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
 * Resizes the first page image to create a thumbnail
 */
export async function generateThumbnail(
  firstPageUrl: string,
  documentId: string
): Promise<string> {
  try {
    // Fetch first page image
    const response = await fetch(firstPageUrl)
    const imageBuffer = Buffer.from(await response.arrayBuffer())

    // Resize to thumbnail size (300px wide) using sharp
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(300, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer()

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
    const loadingTask = pdfjs.getDocument({ data: pdfBytes })
    const pdfDoc = await loadingTask.promise
    return pdfDoc.numPages
  } catch (error) {
    console.error('Failed to get page count:', error)
    return 0
  }
}
