/**
 * Local file storage adapter for development
 * Saves files to public/uploads instead of Vercel Blob
 */

import { writeFile, mkdir, readdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'flipbooks')

/**
 * Ensure upload directory exists
 */
async function ensureDir(path: string) {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true })
  }
}

/**
 * Upload original PDF file
 */
export async function uploadOriginalPdf(
  file: File | Buffer,
  filename: string
): Promise<string> {
  const dir = join(UPLOAD_DIR, 'originals')
  await ensureDir(dir)

  // Add random suffix to filename
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const filenameWithSuffix = filename.replace(/(\.[^.]+)$/, `-${randomSuffix}$1`)

  const filepath = join(dir, filenameWithSuffix)

  // Convert File to Buffer if needed
  let buffer: Buffer
  if (file instanceof Buffer) {
    buffer = file
  } else {
    // File object from browser/FormData
    const arrayBuffer = await (file as File).arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

  await writeFile(filepath, buffer)

  // Return public URL
  return `/uploads/flipbooks/originals/${filenameWithSuffix}`
}

/**
 * Upload processed page image
 */
export async function uploadPageImage(
  imageBuffer: Buffer,
  documentId: string,
  pageNumber: number
): Promise<{ url: string; size: number }> {
  const dir = join(UPLOAD_DIR, documentId)
  await ensureDir(dir)

  const filename = `page-${pageNumber.toString().padStart(4, '0')}.webp`
  const filepath = join(dir, filename)

  await writeFile(filepath, imageBuffer)

  return {
    url: `/uploads/flipbooks/${documentId}/${filename}`,
    size: imageBuffer.length,
  }
}

/**
 * Upload thumbnail image
 */
export async function uploadThumbnail(
  imageBuffer: Buffer,
  documentId: string
): Promise<string> {
  const dir = join(UPLOAD_DIR, documentId)
  await ensureDir(dir)

  const filename = 'thumbnail.webp'
  const filepath = join(dir, filename)

  await writeFile(filepath, imageBuffer)

  return `/uploads/flipbooks/${documentId}/${filename}`
}

/**
 * Delete all files for a document
 */
export async function deleteDocumentFiles(documentId: string): Promise<void> {
  const dir = join(UPLOAD_DIR, documentId)

  if (!existsSync(dir)) {
    return
  }

  const files = await readdir(dir)
  await Promise.all(
    files.map(file => unlink(join(dir, file)))
  )
}

/**
 * Delete a single file by URL
 */
export async function deleteFile(url: string): Promise<void> {
  // Convert URL back to file path
  const relativePath = url.replace('/uploads/flipbooks/', '')
  const filepath = join(UPLOAD_DIR, relativePath)

  if (existsSync(filepath)) {
    await unlink(filepath)
  }
}

/**
 * Get storage stats for a document
 */
export async function getDocumentStorageSize(documentId: string): Promise<number> {
  const dir = join(UPLOAD_DIR, documentId)

  if (!existsSync(dir)) {
    return 0
  }

  const files = await readdir(dir)
  const stats = await Promise.all(
    files.map(file => stat(join(dir, file)))
  )

  return stats.reduce((total, stat) => total + stat.size, 0)
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
