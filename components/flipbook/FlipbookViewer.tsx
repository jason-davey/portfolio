/**
 * Desktop Flipbook Viewer Component
 * Interactive page-turning experience for desktop/tablet
 */

'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Share2,
  X,
} from 'lucide-react'

interface Page {
  page_number: number
  image_url: string
  width: number
  height: number
}

interface FlipbookViewerProps {
  documentId: string
  title: string
  pages: Page[]
  onPageChange?: (page: number) => void
  onComplete?: () => void
}

export function FlipbookViewer({
  documentId,
  title,
  pages,
  onPageChange,
  onComplete,
}: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const flipBookRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  const handlePageChange = useCallback(
    (e: { data: number }) => {
      setCurrentPage(e.data)
      onPageChange?.(e.data)

      // Check if user reached the end
      if (e.data >= totalPages - 1) {
        onComplete?.()
      }
    },
    [totalPages, onPageChange, onComplete]
  )

  const nextPage = () => {
    flipBookRef.current?.pageFlip()?.flipNext()
  }

  const prevPage = () => {
    flipBookRef.current?.pageFlip()?.flipPrev()
  }

  const goToPage = (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) {
      flipBookRef.current?.pageFlip()?.turnToPage(pageNum)
    }
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 2))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.6))

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
      setShowShareMenu(false)
      alert('Link copied to clipboard!')
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage()
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'Home') goToPage(0)
      if (e.key === 'End') goToPage(totalPages - 1)
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalPages, isFullscreen])

  // Calculate optimal dimensions
  const pageWidth = 550
  const pageHeight = 733

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-gradient-to-b from-gray-900 to-black flex flex-col"
    >
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-10">
        <div className="flex-1">
          <h1 className="text-white text-lg font-semibold truncate">{title}</h1>
          <p className="text-gray-400 text-sm">
            Page {currentPage + 1} of {totalPages}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Share Menu */}
        {showShareMenu && (
          <div className="absolute top-16 right-6 bg-white rounded-lg shadow-xl p-4 min-w-[200px]">
            <button
              onClick={handleShare}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Share this flipbook
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Link copied!')
                setShowShareMenu(false)
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
            >
              Copy link
            </button>
          </div>
        )}
      </header>

      {/* Flipbook Container */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s ease-out',
          }}
          className="drop-shadow-2xl"
        >
          <HTMLFlipBook
            ref={flipBookRef}
            width={pageWidth}
            height={pageHeight}
            size="stretch"
            minWidth={315}
            maxWidth={1000}
            minHeight={420}
            maxHeight={1350}
            showCover={true}
            flippingTime={800}
            usePortrait={true}
            startPage={0}
            drawShadow={true}
            className="flipbook"
            onFlip={handlePageChange}
            mobileScrollSupport={false}
            style={{}}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.5}
            showPageCorners={true}
            disableFlipByClick={false}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={30}
          >
            {pages.map((page, index) => (
              <div
                key={page.page_number}
                className="page bg-white shadow-2xl flex items-center justify-center"
                data-density="hard"
              >
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="w-full h-full object-contain"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Controls Footer */}
      <footer className="bg-black/80 backdrop-blur-sm px-6 py-4 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={isFirstPage}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Page Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={totalPages - 1}
                value={currentPage}
                onChange={(e) => goToPage(parseInt(e.target.value))}
                className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                    (currentPage / (totalPages - 1)) * 100
                  }%, #374151 ${(currentPage / (totalPages - 1)) * 100}%, #374151 100%)`,
                }}
              />
            </div>

            <button
              onClick={nextPage}
              disabled={isLastPage}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              disabled={zoom <= 0.6}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>

            <span className="text-white text-sm font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={zoomIn}
              disabled={zoom >= 2}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-24 right-6 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg opacity-50 hover:opacity-100 transition-opacity">
        <p>← → to navigate • Esc to exit fullscreen</p>
      </div>
    </div>
  )
}
