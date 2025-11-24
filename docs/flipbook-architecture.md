# Portfolio Flipbook System Architecture

## Overview
An Issuu-inspired document flipbook system integrated with your Agent-driven portfolio adventure interface, allowing users to browse detailed case studies in an interactive, page-turning format.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js + React)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Adventure Interface (Voiceflow + 3D Globe)                   │
│  • Flipbook Viewer Component (react-pageflip / turn.js)         │
│  • Admin Dashboard (Upload & Management)                        │
│  • Mobile-responsive Reader                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)               │
├─────────────────────────────────────────────────────────────────┤
│  • Document Upload Handler                                      │
│  • PDF-to-Image Conversion (pdf-lib / pdf.js)                   │
│  • Document Processing Pipeline                                 │
│  • Metadata Extraction                                          │
│  • Analytics Tracking                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Storage Layer (Vercel Blob)                  │
├─────────────────────────────────────────────────────────────────┤
│  • Original Documents (.pdf, .doc, .pptx)                       │
│  • Processed Page Images (WebP/JPEG)                            │
│  • Thumbnails & Previews                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (Supabase PostgreSQL)               │
├─────────────────────────────────────────────────────────────────┤
│  • Document Metadata                                            │
│  • Page References                                              │
│  • View Analytics                                               │
│  • Project Relationships                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Admin Dashboard (`/admin/documents`)

**Features:**
- Drag & drop document upload
- Document library with grid/list view
- Status tracking (Draft, Processing, Published)
- Metadata editing (title, description, tags, project association)
- Bulk operations
- Preview before publishing

**Tech Stack:**
- Next.js App Router
- React Dropzone for uploads
- Shadcn/ui components (from v0.dev)
- TanStack Table for document list

**Reference Screens:**
- `issuu-admin-homepage.png` - Upload interface
- `issuu-admin-myLibrary-publications.png` - Document management

---

### 2. Document Processing Pipeline

**Workflow:**
```
Upload → Validation → Conversion → Image Generation →
Storage → Metadata Extraction → Database Entry → Published
```

**Processing Steps:**

#### Step 1: Document Upload
```typescript
// app/api/documents/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // Validate file type and size
  const validTypes = ['application/pdf', 'application/msword',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                      'application/vnd.ms-powerpoint',
                      'application/vnd.openxmlformats-officedocument.presentationml.presentation']

  if (!validTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  // Upload to Vercel Blob
  const blob = await put(`originals/${file.name}`, file, {
    access: 'public',
  })

  // Queue for processing
  await queueDocumentProcessing(blob.url, file.name)

  return Response.json({ success: true, documentId: blob.url })
}
```

#### Step 2: PDF Conversion (if not PDF)
```typescript
// Use LibreOffice or Gotenberg API for .doc/.pptx → PDF
// For Vercel deployment, use external service:
// - CloudConvert API
// - Zamzar API
// - Or pre-convert documents before upload
```

#### Step 3: PDF to Images
```typescript
// lib/pdf-processor.ts
import * as pdfjsLib from 'pdfjs-dist'
import sharp from 'sharp'

export async function convertPdfToImages(pdfUrl: string) {
  const pdf = await pdfjsLib.getDocument(pdfUrl).promise
  const pages = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 }) // High DPI

    // Render to canvas
    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')

    await page.render({ canvasContext: context, viewport }).promise

    // Convert to WebP for optimization
    const buffer = canvas.toBuffer('image/png')
    const optimized = await sharp(buffer)
      .webp({ quality: 85 })
      .toBuffer()

    // Upload to Vercel Blob
    const pageUrl = await put(`pages/${documentId}/page-${i}.webp`, optimized)
    pages.push(pageUrl.url)
  }

  return pages
}
```

#### Step 4: Generate Thumbnails
```typescript
// Create thumbnail from first page
const thumbnail = await sharp(pages[0])
  .resize(400, 560, { fit: 'cover' })
  .webp({ quality: 80 })
  .toBuffer()

const thumbnailUrl = await put(`thumbnails/${documentId}.webp`, thumbnail)
```

---

### 3. Database Schema

```sql
-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,

  -- File references
  original_file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  total_pages INTEGER NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,

  -- Metadata
  project_id UUID REFERENCES projects(id),
  tags TEXT[],
  category VARCHAR(100),

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, processing, published, archived
  processing_progress INTEGER DEFAULT 0, -- 0-100

  -- Analytics
  view_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  avg_time_spent INTERVAL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Document pages table
CREATE TABLE document_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,

  -- Optional OCR text for search
  extracted_text TEXT,

  UNIQUE(document_id, page_number)
);

-- Document analytics
CREATE TABLE document_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id VARCHAR(255), -- Anonymous ID or user ID
  session_id UUID,

  -- Reading behavior
  pages_viewed INTEGER[],
  time_spent_seconds INTEGER,
  completed BOOLEAN DEFAULT false,

  -- Context
  source VARCHAR(100), -- e.g., 'adventure-interface', 'direct-link'
  device_type VARCHAR(50),

  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_published_at ON documents(published_at DESC);
CREATE INDEX idx_document_pages_document_id ON document_pages(document_id);
CREATE INDEX idx_document_views_document_id ON document_views(document_id);
```

---

### 4. Flipbook Viewer Component

**Technology Options:**

**Option A: react-pageflip** (Recommended)
- Lightweight (50KB)
- Mobile-friendly
- Good performance
- MIT License

**Option B: turn.js**
- More realistic page turning
- Larger file size
- jQuery dependency
- Premium features

**Implementation:**

```tsx
// components/flipbook/FlipbookViewer.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Share } from 'lucide-react'

interface FlipbookViewerProps {
  documentId: string
  pages: Array<{ url: string; width: number; height: number }>
  title: string
  onPageChange?: (page: number) => void
  onComplete?: () => void
}

export function FlipbookViewer({
  documentId,
  pages,
  title,
  onPageChange,
  onComplete
}: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [zoom, setZoom] = useState(1)
  const flipBookRef = useRef(null)

  const totalPages = pages.length
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  const handlePageChange = useCallback((e: { data: number }) => {
    setCurrentPage(e.data)
    onPageChange?.(e.data)

    // Track completion
    if (e.data >= totalPages - 1) {
      onComplete?.()
    }
  }, [totalPages, onPageChange, onComplete])

  const nextPage = () => {
    flipBookRef.current?.pageFlip()?.flipNext()
  }

  const prevPage = () => {
    flipBookRef.current?.pageFlip()?.flipPrev()
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6))

  return (
    <div className="relative h-screen w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/80 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-lg font-semibold">{title}</h1>
          <p className="text-gray-400 text-sm">
            Page {currentPage + 1} of {totalPages}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded">
            <Share className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded">
            <Maximize className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Flipbook Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}>
          <HTMLFlipBook
            ref={flipBookRef}
            width={550}
            height={733}
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
          >
            {pages.map((page, index) => (
              <div key={index} className="page bg-white shadow-2xl">
                <img
                  src={page.url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-contain"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Controls */}
      <footer className="bg-black/80 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={isFirstPage}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={totalPages - 1}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  flipBookRef.current?.pageFlip()?.turnToPage(page)
                }}
                className="w-64"
              />
            </div>

            <button
              onClick={nextPage}
              disabled={isLastPage}
              className="p-2 hover:bg-white/10 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-white/10 rounded"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-white/10 rounded"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
```

**Mobile-Optimized Version:**

```tsx
// components/flipbook/MobileFlipbookViewer.tsx
'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Zoom } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/zoom'

export function MobileFlipbookViewer({ pages, title }: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)

  return (
    <div className="h-screen w-full bg-black">
      <Swiper
        modules={[Pagination, Zoom]}
        pagination={{ type: 'fraction' }}
        zoom={true}
        onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex)}
        className="h-full"
      >
        {pages.map((page, index) => (
          <SwiperSlide key={index}>
            <div className="swiper-zoom-container">
              <img
                src={page.url}
                alt={`Page ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
```

---

### 5. Integration with Adventure Interface

**Voiceflow Integration:**

```typescript
// In your Voiceflow flow, create a custom action:
{
  "type": "custom_action",
  "action": "show_case_study",
  "payload": {
    "document_id": "uuid-here",
    "project_name": "ANZ Digital Transformation"
  }
}

// In your React app:
// hooks/useVoiceflow.ts
useEffect(() => {
  window.voiceflow.chat.on('custom_action', (action) => {
    if (action.type === 'show_case_study') {
      router.push(`/flipbook/${action.payload.document_id}`)
    }
  })
}, [])
```

**Example Adventure Flow:**
```
User: "Tell me about your work with ANZ"
Agent: "I led a major digital transformation project for ANZ.
        Would you like to see the detailed case study?"
User: "Yes"
Agent: [Opens flipbook viewer with ANZ case study PDF]
```

---

### 6. Analytics Implementation

```typescript
// lib/analytics.ts
import { createClient } from '@supabase/supabase-js'

export async function trackDocumentView(
  documentId: string,
  viewerId: string,
  context: {
    source: string
    deviceType: string
  }
) {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!)

  await supabase.from('document_views').insert({
    document_id: documentId,
    viewer_id: viewerId,
    session_id: generateSessionId(),
    source: context.source,
    device_type: context.deviceType,
  })

  // Increment view count
  await supabase.rpc('increment_view_count', { document_id: documentId })
}

export async function trackPageView(
  documentId: string,
  sessionId: string,
  pageNumber: number,
  timeSpent: number
) {
  // Track which pages are viewed and for how long
  // This helps understand user engagement
}
```

**Analytics Dashboard:**
```tsx
// app/admin/documents/[id]/analytics/page.tsx
export default async function DocumentAnalyticsPage({ params }) {
  const analytics = await getDocumentAnalytics(params.id)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard title="Total Views" value={analytics.totalViews} />
      <StatCard title="Unique Viewers" value={analytics.uniqueViewers} />
      <StatCard title="Avg. Time" value={analytics.avgTimeSpent} />
      <StatCard title="Completion Rate" value={`${analytics.completionRate}%`} />

      <div className="col-span-full">
        <PageHeatmap pages={analytics.pageViews} />
      </div>

      <div className="col-span-2">
        <ViewsOverTimeChart data={analytics.viewsTimeline} />
      </div>

      <div className="col-span-2">
        <DeviceBreakdown data={analytics.deviceTypes} />
      </div>
    </div>
  )
}
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Components**: Shadcn/ui (via v0.dev)
- **Flipbook**: react-pageflip
- **Mobile Gestures**: swiper
- **Icons**: lucide-react
- **Styling**: Tailwind CSS

### Backend
- **API**: Next.js API Routes
- **PDF Processing**: pdf.js, pdf-lib
- **Image Processing**: sharp
- **Document Conversion**: CloudConvert API (for .doc/.pptx)

### Storage & Database
- **File Storage**: Vercel Blob Storage
- **Database**: Supabase (PostgreSQL)
- **Caching**: Vercel Edge Cache

### Deployment
- **Hosting**: Vercel
- **CDN**: Vercel Edge Network
- **Processing**: Vercel Serverless Functions (with extended timeout)

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic upload and PDF processing

- [ ] Set up database schema in Supabase
- [ ] Create admin upload interface
- [ ] Implement PDF to images conversion
- [ ] Set up Vercel Blob storage
- [ ] Basic document management CRUD

**Deliverable:** Admin can upload a PDF and it's converted to images

---

### Phase 2: Flipbook Viewer (Week 2)
**Goal:** Interactive viewing experience

- [ ] Implement desktop flipbook viewer
- [ ] Implement mobile-optimized viewer
- [ ] Add navigation controls
- [ ] Add zoom functionality
- [ ] Responsive design testing

**Deliverable:** Users can view documents in flipbook format

---

### Phase 3: Integration (Week 3)
**Goal:** Connect with adventure interface

- [ ] Create document-project relationships
- [ ] Implement Voiceflow triggers
- [ ] Add deep linking from 3D globe
- [ ] Create document preview cards
- [ ] Implement sharing functionality

**Deliverable:** Documents accessible from adventure interface

---

### Phase 4: Analytics & Polish (Week 4)
**Goal:** Track engagement and optimize

- [ ] Implement view tracking
- [ ] Create analytics dashboard
- [ ] Add performance monitoring
- [ ] Optimize image loading
- [ ] SEO optimization for documents

**Deliverable:** Complete analytics and optimized performance

---

## File Structure

```
portfolio/
├── app/
│   ├── admin/
│   │   └── documents/
│   │       ├── page.tsx                    # Document library
│   │       ├── upload/
│   │       │   └── page.tsx                # Upload interface
│   │       └── [id]/
│   │           ├── edit/page.tsx           # Edit metadata
│   │           └── analytics/page.tsx      # Analytics
│   ├── flipbook/
│   │   └── [slug]/
│   │       └── page.tsx                    # Public viewer
│   └── api/
│       └── documents/
│           ├── upload/route.ts             # Upload handler
│           ├── process/route.ts            # Processing pipeline
│           ├── [id]/route.ts               # CRUD operations
│           └── analytics/route.ts          # Analytics endpoints
├── components/
│   └── flipbook/
│       ├── FlipbookViewer.tsx              # Desktop viewer
│       ├── MobileFlipbookViewer.tsx        # Mobile viewer
│       ├── DocumentCard.tsx                # Document preview
│       └── UploadZone.tsx                  # Drag & drop upload
├── lib/
│   ├── pdf-processor.ts                    # PDF conversion logic
│   ├── document-service.ts                 # Database operations
│   ├── analytics.ts                        # Analytics tracking
│   └── storage.ts                          # Blob storage helpers
└── docs/
    └── flipbook-architecture.md            # This file
```

---

## Cost Estimation (Monthly)

### Vercel
- **Hobby Plan**: $0 (suitable for testing)
- **Pro Plan**: $20/month (recommended)
  - 1TB bandwidth
  - 100GB Blob storage
  - Extended function execution time

### Supabase
- **Free Tier**: $0
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users
- Suitable for initial launch

### CloudConvert (for .doc/.pptx conversion)
- **Free Tier**: 25 conversions/day
- **Starter Plan**: $9/month (500 conversions)

**Total: $0-29/month** (depending on usage)

---

## Alternative: Simpler MVP Approach

If you want to launch faster, consider this streamlined approach:

### MVP Features Only:
1. **Manual PDF upload only** (skip .doc/.pptx conversion initially)
2. **Pre-process documents locally** before upload (using Acrobat/Preview)
3. **Use existing PDF viewers** (pdf.js with custom UI)
4. **Skip analytics** initially (add later)

This reduces complexity and lets you launch in 1-2 weeks instead of 4.

---

## Next Steps

1. **Review this architecture** and provide feedback
2. **Choose MVP vs Full Build** approach
3. **I'll create the initial structure** with:
   - Database schema
   - Admin upload interface (using v0.dev)
   - Basic PDF viewer
4. **Test with one of your case studies** (e.g., Newman Architects PDF)
5. **Iterate based on results**

---

## Questions for You

1. **Scope**: Do you want to start with MVP (PDF only) or full build (.doc/.pptx support)?
2. **Documents**: How many case study documents do you plan to host? (helps size infrastructure)
3. **Features**: Are analytics important for Phase 1, or can they wait?
4. **Mobile**: Is mobile flipbook critical, or desktop-first acceptable?
5. **Integration**: Should documents be embedded in adventure interface or open in new tab/modal?

Let me know your preferences and I can start building immediately!
