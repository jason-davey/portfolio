/**
 * Client-side Flipbook Viewer Wrapper
 * Detects device and renders appropriate viewer
 */

'use client'

import { useEffect, useState } from 'react'
import { FlipbookViewer } from '@/components/flipbook/FlipbookViewer'
import { MobileViewer } from '@/components/flipbook/MobileViewer'

interface Page {
  page_number: number
  image_url: string
  width: number
  height: number
}

interface FlipbookViewerClientProps {
  documentId: string
  title: string
  pages: Page[]
}

export function FlipbookViewerClient({
  documentId,
  title,
  pages,
}: FlipbookViewerClientProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Detect mobile device
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const smallScreen = window.innerWidth < 768
      setIsMobile(mobile || smallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handlePageChange = (page: number) => {
    // Track page views (can integrate with analytics)
    console.log(`Viewed page ${page + 1}`)
  }

  const handleComplete = () => {
    // Track completion (can integrate with analytics)
    console.log('User completed viewing document')
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading flipbook...</div>
      </div>
    )
  }

  if (isMobile) {
    return (
      <MobileViewer
        documentId={documentId}
        title={title}
        pages={pages}
        onPageChange={handlePageChange}
        onComplete={handleComplete}
      />
    )
  }

  return (
    <FlipbookViewer
      documentId={documentId}
      title={title}
      pages={pages}
      onPageChange={handlePageChange}
      onComplete={handleComplete}
    />
  )
}
