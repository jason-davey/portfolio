# ✅ Flipbook System - Ready to Run!

## Quick Start (3 Commands)

```bash
# 1. Start the flipbook server
./start-flipbook.sh

# 2. Open in browser
open http://localhost:4000

# 3. Go to admin to upload your first PDF
open http://localhost:4000/admin/flipbooks
```

That's it! The system is now running on **port 4000**.

---

## What You Can Do Now

### 1. View Homepage
http://localhost:4000

Clean landing page with links to admin dashboard.

### 2. Upload Documents
http://localhost:4000/admin/flipbooks/new

- Drag & drop a PDF
- Enter title and description
- Click "Upload & Process"
- Wait 30-60 seconds
- View your flipbook!

### 3. View Flipbooks
http://localhost:4000/flipbook/[slug]

Each uploaded document gets a unique URL based on its title.

---

## Environment Setup (Required)

Before uploading documents, configure your `.env.local`:

```bash
# Supabase (get from supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Vercel Blob (get from vercel.com or auto-configured)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

### Get Supabase Credentials

1. Go to https://supabase.com
2. Create project (or use existing)
3. Go to Settings → API
4. Copy URL and keys

### Get Vercel Blob Token

**Option A: Deploy first (easiest)**
```bash
vercel --prod
```
Token will be auto-configured.

**Option B: Create manually**
1. Go to https://vercel.com
2. Your Project → Storage → Blob
3. Create store
4. Copy token

### Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Copy entire content from:
-- supabase/migrations/20250118_flipbook_schema.sql
```

---

## System Architecture

```
Your Setup:
┌──────────────────────────────────┐
│  Main Portfolio (Vite)           │
│  http://localhost:5173           │  (Run separately)
│  • 3D Globe                      │
│  • Voiceflow                     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  Flipbook System (Next.js)       │
│  http://localhost:4000           │  (This server)
│  • PDF Upload                    │
│  • Admin Dashboard               │
│  • Flipbook Viewer               │
└──────────────────────────────────┘
```

---

## Commands Cheat Sheet

```bash
# Start flipbook system
./start-flipbook.sh

# Or manually:
npx next dev -p 4000

# Stop server
# Press Ctrl+C

# Or kill process:
pkill -f "next dev"

# Check if running:
curl http://localhost:4000

# View logs:
# Check terminal where server is running
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill existing process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use different port
npx next dev -p 4001
```

### Environment Variables Not Found
Check `.env.local` exists and has correct values:
```bash
cat .env.local
```

### Database Connection Error
1. Verify Supabase credentials
2. Check database migration was run
3. Test connection: Go to Supabase dashboard

### Canvas/Sharp Installation Issues
```bash
# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg

# Reinstall packages
npm rebuild canvas sharp
```

---

## Integration with Main Portfolio

### Link from Vite App

```typescript
// In your main portfolio (Vite app)
<a
  href="http://localhost:4000/flipbook/my-case-study"
  target="_blank"
  rel="noopener noreferrer"
>
  View Case Study
</a>
```

### Voiceflow Integration

```typescript
// In your main app
window.voiceflow?.chat?.on('custom_action', (action) => {
  if (action.type === 'show_case_study') {
    window.open(
      `http://localhost:4000/flipbook/${action.payload.slug}`,
      '_blank'
    )
  }
})
```

---

## File Structure

```
portfolio/
├── start-flipbook.sh ................ Start script (use this!)
├── .env.local ....................... Environment variables
├── next.config.js ................... Next.js configuration
├── app/ ............................. Next.js pages
│   ├── layout.tsx ................... Root layout
│   ├── page.tsx ..................... Homepage
│   ├── api/flipbooks/ ............... API endpoints
│   ├── admin/flipbooks/ ............. Admin interface
│   └── flipbook/[slug]/ ............. Public viewer
├── components/flipbook/ ............. React components
└── lib/flipbook/ .................... Core logic
```

---

## Next Steps

1. ✅ **Start server**: `./start-flipbook.sh`
2. ⏳ **Configure env**: Edit `.env.local`
3. ⏳ **Run migration**: In Supabase SQL Editor
4. ⏳ **Upload PDF**: Go to admin dashboard
5. ⏳ **View flipbook**: Test the viewer
6. ⏳ **Integrate**: Link from main portfolio

---

## Documentation

- **[FLIPBOOK-QUICKSTART.md](FLIPBOOK-QUICKSTART.md)** - Quick reference
- **[FLIPBOOK-SETUP-PORT-4000.md](FLIPBOOK-SETUP-PORT-4000.md)** - Port config details
- **[README.flipbook.md](README.flipbook.md)** - Full system overview
- **[docs/flipbook-architecture.md](docs/flipbook-architecture.md)** - Technical details

---

## Need Help?

1. Check if server is running: `curl http://localhost:4000`
2. View server logs in terminal
3. Check `.env.local` configuration
4. Verify database migration ran successfully
5. See troubleshooting section above

---

**Status:** ✅ System configured and ready to run!

**Your command:** `./start-flipbook.sh`
