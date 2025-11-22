/**
 * Storage operations for Flipbook system
 * Using Vercel Blob Storage for file hosting
 */

import { put, del, list } from '@vercel/blob'

/**
 * Upload original PDF file
 */
export async function uploadOriginalPdf(
  file: File | Buffer,
  filename: string
): Promise<string> {
  const blob = await put(`flipbooks/originals/${filename}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return blob.url
}

/**
 * Upload processed page image
 */
export async function uploadPageImage(
  imageBuffer: Buffer,
  documentId: string,
  pageNumber: number
): Promise<{ url: string; size: number }> {
  const filename = `flipbooks/${documentId}/page-${pageNumber.toString().padStart(4, '0')}.webp`

  const blob = await put(filename, imageBuffer, {
    access: 'public',
    contentType: 'image/webp',
  })

  return {
    url: blob.url,
    size: imageBuffer.length, // Use buffer size since PutBlobResult doesn't include size
  }
}

/**
 * Upload thumbnail image
 */
export async function uploadThumbnail(
  imageBuffer: Buffer,
  documentId: string
): Promise<string> {
  const filename = `flipbooks/${documentId}/thumbnail.webp`

  const blob = await put(filename, imageBuffer, {
    access: 'public',
    contentType: 'image/webp',
  })

  return blob.url
}

/**
 * Delete all files for a document
 */
export async function deleteDocumentFiles(documentId: string): Promise<void> {
  // List all blobs for this document
  const { blobs } = await list({
    prefix: `flipbooks/${documentId}/`,
  })

  // Delete all files
  await Promise.all(
    blobs.map(blob => del(blob.url))
  )
}

/**
 * Delete a single file by URL
 */
export async function deleteFile(url: string): Promise<void> {
  await del(url)
}

/**
 * Get storage stats for a document
 */
export async function getDocumentStorageSize(documentId: string): Promise<number> {
  const { blobs } = await list({
    prefix: `flipbooks/${documentId}/`,
  })

  // List results include size property
  return blobs.reduce((total, blob) => total + (blob.size || 0), 0)
}

/**
 * Validate file is a PDF
 */
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['application/pdf']
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File must be a PDF document',
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB',
    }
  }

  return { valid: true }
}

/**
 * Generate a safe filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase()
}
