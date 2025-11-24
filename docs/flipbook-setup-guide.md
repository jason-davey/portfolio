# Flipbook System Setup Guide

## Prerequisites

- Node.js 18+ installed
- Vercel account (for deployment and Blob storage)
- Supabase account (for database)
- Existing Next.js 14+ project

---

## Installation Steps

### 1. Install Dependencies

```bash
npm install --save \
  react-pageflip \
  swiper \
  react-dropzone \
  @vercel/blob \
  @supabase/supabase-js \
  pdfjs-dist \
  canvas \
  sharp \
  lucide-react

# TypeScript types
npm install --save-dev \
  @types/react-dropzone
```

### 2. Set Up Database (Supabase)

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Run the migration file:

```bash
# Copy the SQL from supabase/migrations/20250118_flipbook_schema.sql
# and execute in Supabase SQL Editor
```

### 3. Configure Environment Variables

Create or update `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Blob Storage (auto-configured on Vercel, or get from dashboard)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Deploy
vercel --prod
```

During deployment:
1. Vercel will automatically set up Blob storage
2. Add your Supabase environment variables in Vercel dashboard
3. Enable "Serverless Function" with max duration: 60s (Settings → Functions)

---

## Quick Start (Local Development)

### 1. Run Database Migration

```bash
# In Supabase SQL Editor, run:
supabase/migrations/20250118_flipbook_schema.sql
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Admin Interface

```
http://localhost:3000/admin/flipbooks
```

### 4. Upload Your First PDF

1. Click "Upload New"
2. Drag and drop a PDF file
3. Enter title and description
4. Click "Upload & Process"
5. Wait for processing (30-60 seconds)
6. View your flipbook!

---

## File Structure Created

```
portfolio/
├── app/
│   ├── api/
│   │   └── flipbooks/
│   │       ├── route.ts                    # List documents
│   │       ├── upload/route.ts             # Upload & process
│   │       └── [id]/route.ts               # CRUD operations
│   ├── admin/
│   │   └── flipbooks/
│   │       ├── page.tsx                    # Document library
│   │       └── new/page.tsx                # Upload page
│   └── flipbook/
│       └── [slug]/
│           ├── page.tsx                    # Public viewer (SSR)
│           └── FlipbookViewerClient.tsx    # Client wrapper
├── components/
│   └── flipbook/
│       ├── FlipbookViewer.tsx              # Desktop viewer
│       ├── MobileViewer.tsx                # Mobile viewer
│       └── UploadZone.tsx                  # Upload component
├── lib/
│   └── flipbook/
│       ├── db.ts                           # Database operations
│       ├── storage.ts                      # Blob storage
│       └── processor.ts                    # PDF processing
└── supabase/
    └── migrations/
        └── 20250118_flipbook_schema.sql    # Database schema
```

---

## Usage

### Admin: Upload Documents

```typescript
// Navigate to /admin/flipbooks/new
// Or programmatically trigger upload:

const formData = new FormData()
formData.append('file', pdfFile)
formData.append('title', 'My Case Study')
formData.append('description', 'Project overview')

const response = await fetch('/api/flipbooks/upload', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log('Document ID:', data.document.id)
```

### Public: View Flipbook

```typescript
// Direct link: /flipbook/my-case-study-slug
// Or embed in component:

import { FlipbookViewer } from '@/components/flipbook/FlipbookViewer'

export function MyComponent() {
  return (
    <FlipbookViewer
      documentId="uuid"
      title="My Document"
      pages={[...]}
    />
  )
}
```

### Voiceflow Integration

In your Voiceflow custom action:

```json
{
  "type": "open_flipbook",
  "slug": "my-case-study",
  "url": "https://yoursite.com/flipbook/my-case-study"
}
```

In your React app:

```typescript
useEffect(() => {
  window.voiceflow?.chat?.on('custom_action', (action) => {
    if (action.type === 'open_flipbook') {
      router.push(`/flipbook/${action.slug}`)
    }
  })
}, [])
```

---

## Troubleshooting

### PDF Processing Fails

**Problem**: Document stuck in "processing" status

**Solutions**:
1. Check PDF file is valid (try opening in Adobe Reader)
2. Verify file size is under 50MB
3. Check Vercel function logs for errors
4. Ensure Sharp and Canvas are properly installed:
   ```bash
   npm rebuild sharp canvas
   ```

### Images Not Loading

**Problem**: Pages show broken images

**Solutions**:
1. Verify Vercel Blob token is set correctly
2. Check Blob storage dashboard for uploaded files
3. Ensure CORS is configured for your domain

### Slow Processing

**Problem**: PDF takes too long to process

**Solutions**:
1. Reduce scale in processor (default is 2, try 1.5)
2. Reduce WebP quality (default 85, try 75)
3. Increase Vercel function timeout (max 300s on Pro plan)

---

## Performance Optimization

### 1. Image Optimization

Adjust settings in `lib/flipbook/processor.ts`:

```typescript
const options = {
  scale: 1.5,        // Lower = faster, smaller files
  quality: 75,       // Lower = faster, smaller files
  maxWidth: 1400,    // Lower = faster, smaller files
}
```

### 2. Caching

Add caching headers in API routes:

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
})
```

### 3. Lazy Loading

Images are already lazy-loaded in viewer components (only first 3 pages eager).

---

## Next Steps

### MVP Launch Checklist

- [ ] Run database migration in Supabase
- [ ] Set environment variables
- [ ] Deploy to Vercel
- [ ] Upload test PDF document
- [ ] Verify flipbook displays correctly
- [ ] Test on mobile device
- [ ] Share link with someone to verify public access

### SaaS Preparation

For future SaaS build:

1. **Multi-tenancy**: Add `user_id` column to tables
2. **Authentication**: Implement NextAuth.js or Supabase Auth
3. **Billing**: Integrate Stripe for subscriptions
4. **Usage Limits**: Track documents per user
5. **Custom Domains**: Allow white-label deployments
6. **Analytics**: Add PostHog or Mixpanel
7. **Embed Codes**: Generate iframe embeds

---

## API Reference

### Upload Document

```
POST /api/flipbooks/upload
Content-Type: multipart/form-data

Body:
- file: PDF file
- title: string (required)
- description: string (optional)
- project_id: UUID (optional)

Response:
{
  "success": true,
  "document": {
    "id": "uuid",
    "slug": "my-document",
    "title": "My Document",
    "status": "processing"
  }
}
```

### Get Document Status

```
GET /api/flipbooks/upload?id=uuid

Response:
{
  "id": "uuid",
  "status": "published",
  "progress": 100,
  "total_pages": 24
}
```

### List Documents

```
GET /api/flipbooks?status=published&limit=10

Response:
{
  "documents": [...],
  "total": 10
}
```

### Get Document by ID

```
GET /api/flipbooks/[id]

Response:
{
  "id": "uuid",
  "title": "My Document",
  "pages": [...]
}
```

### Delete Document

```
DELETE /api/flipbooks/[id]

Response:
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Support

For issues or questions:
1. Check GitHub Issues
2. Review Vercel function logs
3. Check Supabase logs for database errors
4. Verify environment variables are set

---

**Built with:** Next.js 14 • React • TypeScript • Supabase • Vercel • Sharp • PDF.js
