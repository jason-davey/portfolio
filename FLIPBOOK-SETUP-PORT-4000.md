# Flipbook Setup - Running on Port 4000

Your portfolio uses Vite, but the flipbook is built with Next.js. Here's how to run them together.

## Architecture

```
┌──────────────────────────────────────┐
│  Main Portfolio (Vite)               │
│  http://localhost:5173               │
│                                      │
│  • 3D Globe interface                │
│  • Voiceflow adventure               │
│  • Main content                      │
└──────────┬───────────────────────────┘
           │
           │ Links to flipbooks
           ▼
┌──────────────────────────────────────┐
│  Flipbook App (Next.js)              │
│  http://localhost:4000               │
│                                      │
│  • PDF upload & processing           │
│  • Admin dashboard                   │
│  • Flipbook viewer                   │
└──────────────────────────────────────┘
```

## Installation Steps

### 1. Create Next.js Configuration

```bash
cd /Users/jd/Projects/portfolio

# Copy the flipbook-specific package.json
cp package.flipbook.json package.json.flipbook

# Rename Next.js config
cp next.config.flipbook.js next.config.js
```

### 2. Install Dependencies

```bash
# Install Next.js and flipbook dependencies
npm install next@14.1.0
npm install react-pageflip swiper react-dropzone
npm install @vercel/blob @supabase/supabase-js
npm install pdfjs-dist canvas sharp lucide-react

# Dev dependencies
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev tailwindcss postcss autoprefixer

# System dependencies (macOS)
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

### 3. Configure Scripts

Add to your main `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:flipbook": "next dev -p 4000",
    "dev:both": "concurrently \"npm run dev\" \"npm run dev:flipbook\"",
    "build:flipbook": "next build",
    "start:flipbook": "next start -p 4000"
  }
}
```

Optional - Install concurrently to run both:
```bash
npm install --save-dev concurrently
```

### 4. Set Up Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel Blob
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

### 5. Run Database Migration

In Supabase SQL Editor:
```sql
-- Copy and run: supabase/migrations/20250118_flipbook_schema.sql
```

### 6. Create Tailwind Config (if needed)

```bash
npx tailwindcss init -p
```

```js
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 7. Create Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Running the Apps

### Option A: Run Separately (Recommended for Development)

**Terminal 1 - Main Portfolio:**
```bash
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Flipbook:**
```bash
npm run dev:flipbook
# Runs on http://localhost:4000
```

### Option B: Run Together

```bash
npm run dev:both
# Runs both simultaneously
```

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Main Portfolio | http://localhost:5173 | Your Vite app |
| Flipbook Admin | http://localhost:4000/admin/flipbooks | Upload & manage PDFs |
| Flipbook Viewer | http://localhost:4000/flipbook/[slug] | Public viewer |

## Linking from Main Portfolio

In your Vite app, link to flipbooks:

```typescript
// src/components/ProjectCard.tsx
export function ProjectCard({ project }) {
  return (
    <div>
      <h3>{project.title}</h3>
      <a
        href={`http://localhost:4000/flipbook/${project.flipbookSlug}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Case Study
      </a>
    </div>
  )
}
```

Or use window.open:

```typescript
function openFlipbook(slug: string) {
  window.open(
    `http://localhost:4000/flipbook/${slug}`,
    '_blank',
    'width=1200,height=800'
  )
}
```

## Voiceflow Integration

In your main app:

```typescript
// src/hooks/useVoiceflow.ts
useEffect(() => {
  window.voiceflow?.chat?.on('custom_action', (action) => {
    if (action.type === 'show_case_study') {
      // Open in new window
      window.open(
        `http://localhost:4000/flipbook/${action.payload.slug}`,
        '_blank'
      )

      // Or redirect in same window
      // window.location.href = `http://localhost:4000/flipbook/${slug}`
    }
  })
}, [])
```

## Deployment

When deploying to production:

**Option 1: Same Domain (Recommended)**
- Deploy both apps to Vercel
- Use path-based routing: `yoursite.com/flipbooks/*`
- Configure Vercel rewrites

**Option 2: Subdomain**
- Main: `yoursite.com`
- Flipbooks: `docs.yoursite.com` or `flipbooks.yoursite.com`

### Vercel Configuration (Option 1)

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/flipbooks/:path*",
      "destination": "https://your-flipbook-app.vercel.app/:path*"
    }
  ]
}
```

## Testing Checklist

- [ ] Main app runs on :5173
- [ ] Flipbook runs on :4000
- [ ] Can access admin dashboard
- [ ] Can upload a PDF
- [ ] Processing completes successfully
- [ ] Can view flipbook from main app
- [ ] Links work correctly
- [ ] Both apps can run simultaneously

## Troubleshooting

### Port Already in Use

If port 4000 is taken:

```bash
# Find what's using port 4000
lsof -ti:4000

# Kill the process
kill -9 $(lsof -ti:4000)

# Or use a different port
npm run dev:flipbook -- -p 4001
```

### Canvas Installation Issues

```bash
# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Then reinstall
npm rebuild canvas
```

### Next.js Not Found

```bash
npm install next@14.1.0 --force
```

## File Structure

```
portfolio/
├── vite.config.js              # Vite config (main app)
├── next.config.js              # Next.js config (flipbook)
├── package.json                # Combined dependencies
├── src/                        # Vite app source
│   ├── components/
│   ├── hooks/
│   └── ...
└── app/                        # Next.js app (flipbook)
    ├── api/flipbooks/
    ├── admin/flipbooks/
    └── flipbook/[slug]/
```

## Alternative: Single Port Setup

If you must run everything on one port, you'll need to:

1. Convert flipbook to React components (no SSR)
2. Handle PDF processing via separate API
3. Integrate into Vite build

This is more complex and loses some benefits. Let me know if you need this approach.

## Quick Start Commands

```bash
# 1. Install everything
npm install

# 2. Start main app
npm run dev

# 3. In another terminal, start flipbook
npm run dev:flipbook

# 4. Visit:
# - Main app: http://localhost:5173
# - Flipbook: http://localhost:4000/admin/flipbooks
```

That's it! Your flipbook system will run on port 4000 alongside your main portfolio on 5173.
