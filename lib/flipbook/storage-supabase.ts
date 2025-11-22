/**
 * Supabase Storage adapter for flipbook system
 * Uses Supabase Storage buckets for file hosting
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKET_NAME = 'flipbooks'

/**
 * Ensure bucket exists
 */
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()

  if (!buckets?.find(b => b.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800, // 50MB
    })
  }
}

/**
 * Upload original PDF file
 */
export async function uploadOriginalPdf(
  file: File | Buffer,
  filename: string
): Promise<string> {
  await ensureBucket()

  // Add random suffix to filename
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const filenameWithSuffix = filename.replace(/(\.[^.]+)$/, `-${randomSuffix}$1`)
  const path = `originals/${filenameWithSuffix}`

  // Convert File to ArrayBuffer if needed
  let fileData: ArrayBuffer | Buffer
  if (file instanceof Buffer) {
    fileData = file
  } else {
    // File object from browser/FormData
    fileData = await (file as File).arrayBuffer()
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, fileData, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload PDF: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Upload processed page image
 */
export async function uploadPageImage(
  imageBuffer: Buffer,
  documentId: string,
  pageNumber: number
): Promise<{ url: string; size: number }> {
  await ensureBucket()

  const filename = `page-${pageNumber.toString().padStart(4, '0')}.webp`
  const path = `${documentId}/${filename}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, imageBuffer, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (error) {
    throw new Error(`Failed to upload page image: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return {
    url: publicUrl,
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
  await ensureBucket()

  const path = `${documentId}/thumbnail.webp`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, imageBuffer, {
      contentType: 'image/webp',
      upsert: true, // Allow overwrite for thumbnails
    })

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Delete all files for a document
 */
export async function deleteDocumentFiles(documentId: string): Promise<void> {
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(documentId)

  if (files && files.length > 0) {
    const filePaths = files.map(file => `${documentId}/${file.name}`)
    await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths)
  }
}

/**
 * Delete a single file by URL
 */
export async function deleteFile(url: string): Promise<void> {
  // Extract path from public URL
  const urlObj = new URL(url)
  const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/flipbooks\/(.+)/)

  if (pathMatch) {
    const path = pathMatch[1]
    await supabase.storage
      .from(BUCKET_NAME)
      .remove([path])
  }
}

/**
 * Get storage stats for a document
 */
export async function getDocumentStorageSize(documentId: string): Promise<number> {
  const { data: files } = await supabase.storage
    .from(BUCKET_NAME)
    .list(documentId)

  if (!files) return 0

  // Note: Supabase doesn't return file sizes in list, so we return count instead
  return files.length
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
