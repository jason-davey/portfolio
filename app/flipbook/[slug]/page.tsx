/**
 * Public Flipbook Page
 * /flipbook/[slug]
 * Responsive viewer that adapts to device type
 */

import { notFound } from 'next/navigation'
import { getDocumentBySlug } from '@/lib/flipbook/db'
import { FlipbookViewerClient } from './FlipbookViewerClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface FlipbookPageProps {
  params: {
    slug: string
  }
}

export default async function FlipbookPage({ params }: FlipbookPageProps) {
  const document = await getDocumentBySlug(params.slug)

  if (!document || document.status !== 'published') {
    notFound()
  }

  return (
    <FlipbookViewerClient
      documentId={document.id}
      title={document.title}
      pages={document.pages}
    />
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: FlipbookPageProps) {
  const document = await getDocumentBySlug(params.slug)

  if (!document) {
    return {
      title: 'Document Not Found',
    }
  }

  return {
    title: `${document.title} | Flipbook`,
    description: document.description || `View ${document.title} as an interactive flipbook`,
    openGraph: {
      title: document.title,
      description: document.description || undefined,
      images: document.thumbnail_url ? [document.thumbnail_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: document.title,
      description: document.description || undefined,
      images: document.thumbnail_url ? [document.thumbnail_url] : [],
    },
  }
}
