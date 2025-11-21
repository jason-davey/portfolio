/**
 * Mobile Flipbook Viewer Component
 * Swipe-based navigation optimized for mobile devices
 */

'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Zoom, Keyboard } from 'swiper/modules'
import { Share2, X } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

interface Page {
  page_number: number
  image_url: string
  width: number
  height: number
}

interface MobileViewerProps {
  documentId: string
  title: string
  pages: Page[]
  onPageChange?: (page: number) => void
  onComplete?: () => void
  onClose?: () => void
}

export function MobileViewer({
  documentId,
  title,
  pages,
  onPageChange,
  onComplete,
  onClose,
}: MobileViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [showControls, setShowControls] = useState(true)

  const totalPages = pages.length

  const handleSlideChange = (swiper: any) => {
    const page = swiper.activeIndex
    setCurrentPage(page)
    onPageChange?.(page)

    if (page >= totalPages - 1) {
      onComplete?.()
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
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      {showControls && (
        <header className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-4 py-4 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h1 className="text-white text-base font-semibold truncate">
                {title}
              </h1>
              <p className="text-gray-300 text-xs">
                {currentPage + 1} / {totalPages}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-white/10 rounded-full active:bg-white/20 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full active:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Swiper Container */}
      <div
        className="flex-1"
        onClick={() => setShowControls(!showControls)}
      >
        <Swiper
          modules={[Pagination, Zoom, Keyboard]}
          pagination={{
            type: 'fraction',
            el: '.swiper-pagination-custom',
          }}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
          }}
          keyboard={{
            enabled: true,
          }}
          onSlideChange={handleSlideChange}
          className="h-full w-full"
          spaceBetween={0}
          slidesPerView={1}
        >
          {pages.map((page, index) => (
            <SwiperSlide key={page.page_number}>
              <div className="swiper-zoom-container flex items-center justify-center w-full h-full">
                <img
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  className="max-w-full max-h-full object-contain"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Footer with pagination */}
      {showControls && (
        <footer className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 py-6 safe-area-bottom">
          <div className="flex items-center justify-center">
            <div className="swiper-pagination-custom text-white font-medium bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm" />
          </div>

          {/* Hint */}
          <p className="text-center text-gray-300 text-xs mt-3">
            Swipe to navigate • Pinch to zoom • Tap to toggle controls
          </p>
        </footer>
      )}
    </div>
  )
}

// Custom styles for better mobile experience
const mobileStyles = `
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }

  .safe-area-bottom {
    padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
  }

  .swiper-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }

  .swiper-pagination-fraction {
    color: white;
    font-size: 14px;
  }

  .swiper-zoom-container {
    cursor: grab;
  }

  .swiper-zoom-container:active {
    cursor: grabbing;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = mobileStyles
  document.head.appendChild(styleElement)
}
