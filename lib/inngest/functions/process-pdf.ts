/**
 * Inngest Function: Process PDF to Images
 * Background job that converts PDF pages to images
 *
 * Note: Uses dynamic imports to avoid webpack bundling issues with heavy dependencies
 */

import { inngest } from '../client'

export const processPdfFunction = inngest.createFunction(
  {
    id: 'process-pdf-document',
    name: 'Process PDF Document',
    retries: 2,
  },
  { event: 'flipbook/pdf.uploaded' },
  async ({ event, step }) => {
    const { documentId, pdfUrl } = event.data

    console.log(`📄 Starting PDF processing for document: ${documentId}`)

    try {
      // Step 1: Process the PDF (dynamic import to avoid bundling issues)
      await step.run('process-pdf', async () => {
        // Dynamically import heavy dependencies only when needed
        const { processDocument } = await import('@/lib/flipbook/processor')
        await processDocument(pdfUrl, documentId)
        return { success: true }
      })

      console.log(`✅ Successfully processed document: ${documentId}`)

      return {
        success: true,
        documentId,
        message: 'PDF processed successfully',
      }
    } catch (error) {
      console.error(`❌ Processing failed for document ${documentId}:`, error)

      // Mark document as failed in database
      await step.run('mark-error', async () => {
        const { markDocumentError } = await import('@/lib/flipbook/db')
        await markDocumentError(
          documentId,
          error instanceof Error ? error.message : 'Unknown processing error'
        )
      })

      throw error
    }
  }
)
