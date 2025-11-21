/**
 * Inngest API Route
 * Serves Inngest functions for background job processing
 */

import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { processPdfFunction } from '@/lib/inngest/functions/process-pdf'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processPdfFunction,
  ],
})
