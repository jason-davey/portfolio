# 📚 Flipbook System - Interactive PDF Viewer

Transform your PDF documents into beautiful, interactive flipbooks with page-turning animations. Built for your portfolio, scalable for SaaS.

## ✨ Features

### MVP (Current Build)
- ✅ **PDF Upload** - Drag & drop interface
- ✅ **Auto Processing** - Converts PDF to high-quality WebP images
- ✅ **Desktop Viewer** - Realistic page-turning animations
- ✅ **Mobile Viewer** - Swipe-based navigation with pinch zoom
- ✅ **Admin Dashboard** - Manage all your documents
- ✅ **Public Sharing** - Shareable links for each flipbook
- ✅ **Responsive** - Works beautifully on all devices
- ✅ **Fast Processing** - 30-60 seconds per document
- ✅ **SEO Optimized** - Meta tags and Open Graph support

### Future SaaS Features (Roadmap)
- 🔜 Multi-user authentication
- 🔜 Usage analytics dashboard
- 🔜 Custom branding/white-label
- 🔜 Embed codes for external sites
- 🔜 .doc/.pptx support
- 🔜 Team collaboration
- 🔜 API access
- 🔜 Subscription billing

## 🚀 Quick Start

### 1. Run Setup Script

```bash
chmod +x scripts/setup-flipbook.sh
./scripts/setup-flipbook.sh
```

### 2. Configure Environment

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

### 3. Run Database Migration

In Supabase SQL Editor, run:
```sql
-- Copy contents from: supabase/migrations/20250118_flipbook_schema.sql
```

### 4. Start Development

```bash
npm run dev
```

Visit: http://localhost:3000/admin/flipbooks

## 📖 Usage

### Upload a Document

1. Go to `/admin/flipbooks`
2. Click "Upload New"
3. Drag and drop your PDF
4. Enter title and description
5. Wait for processing (~30-60 seconds)
6. View your flipbook!

### Share a Flipbook

Each document gets a public URL:
```
https://yoursite.com/flipbook/document-slug
```

### Integrate with Voiceflow

In your adventure interface:

```typescript
// Listen for Voiceflow custom actions
window.voiceflow?.chat?.on('custom_action', (action) => {
  if (action.type === 'show_case_study') {
    router.push(`/flipbook/${action.payload.slug}`)
  }
})
```

In Voiceflow flow:
```json
{
  "type": "custom_action",
  "action": "show_case_study",
  "payload": {
    "slug": "anz-digital-transformation"
  }
}
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Next.js Frontend (React + TypeScript)  │
├─────────────────────────────────────────┤
│  • Admin Dashboard                      │
│  • Desktop Flipbook (react-pageflip)    │
│  • Mobile Viewer (Swiper)               │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Next.js API Routes (Serverless)      │
├─────────────────────────────────────────┤
│  • Upload Handler                       │
│  • PDF → Images (pdf.js + Sharp)        │
│  • CRUD Operations                      │
└─────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌────────────────┐  ┌──────────────┐
│ Vercel Blob    │  │  Supabase    │
│ Storage        │  │  PostgreSQL  │
├────────────────┤  ├──────────────┤
│ • PDFs         │  │ • Documents  │
│ • Page Images  │  │ • Pages      │
│ • Thumbnails   │  │ • Metadata   │
└────────────────┘  └──────────────┘
```

## 📁 File Structure

```
portfolio/
├── app/
│   ├── api/flipbooks/              # API endpoints
│   ├── admin/flipbooks/            # Admin dashboard
│   └── flipbook/[slug]/            # Public viewer
├── components/flipbook/            # React components
├── lib/flipbook/                   # Core logic
├── supabase/migrations/            # Database schema
└── docs/                           # Documentation
```

## 🔧 API Reference

### Upload Document
```http
POST /api/flipbooks/upload
Content-Type: multipart/form-data

{
  file: File,
  title: string,
  description?: string
}
```

### Get Document
```http
GET /api/flipbooks/[id]
```

### List Documents
```http
GET /api/flipbooks?status=published&limit=10
```

### Delete Document
```http
DELETE /api/flipbooks/[id]
```

## 🎨 Customization

### Processing Settings

Edit `lib/flipbook/processor.ts`:

```typescript
const options = {
  scale: 2,          // Image quality (1-3)
  quality: 85,       // WebP quality (1-100)
  maxWidth: 1600,    // Max page width
}
```

### Viewer Settings

Edit `components/flipbook/FlipbookViewer.tsx`:

```typescript
<HTMLFlipBook
  width={550}        // Page width
  height={733}       // Page height
  flippingTime={800} // Animation speed (ms)
  // ... other props
/>
```

## 📊 Cost Estimate (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Vercel** | 100GB bandwidth, 1GB storage | $20/month (1TB, 100GB) |
| **Supabase** | 500MB DB, 1GB storage | Free tier sufficient |
| **Total** | **$0** | **$20/month** |

**Scalable to:** ~500 documents, ~10K monthly views on free tier

## 🚢 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configure on Vercel

1. Add environment variables in dashboard
2. Enable Blob Storage (automatic)
3. Set function max duration to 60s
4. Deploy!

## 🐛 Troubleshooting

### Processing Fails
- Verify PDF is valid and under 50MB
- Check Vercel function logs
- Rebuild Sharp: `npm rebuild sharp`

### Images Not Loading
- Verify Vercel Blob token is set
- Check CORS configuration
- Inspect network tab for errors

### Slow Processing
- Reduce scale/quality in processor
- Increase Vercel function timeout
- Consider pre-processing locally

## 📚 Documentation

- **[Setup Guide](docs/flipbook-setup-guide.md)** - Detailed installation
- **[Architecture](docs/flipbook-architecture.md)** - Technical deep dive
- **[MVP Plan](docs/flipbook-mvp-plan.md)** - Development roadmap
- **[Dependencies](docs/flipbook-dependencies.json)** - Package list

## 🎯 SaaS Roadmap

### Phase 1: MVP (✅ Complete)
- Core flipbook functionality
- Single admin user
- Manual uploads only

### Phase 2: Multi-Tenant (Next)
- User authentication (NextAuth)
- User workspaces
- Document ownership
- Usage limits

### Phase 3: Monetization
- Stripe integration
- Subscription tiers:
  - **Free**: 5 documents
  - **Pro ($19/mo)**: 100 documents
  - **Business ($99/mo)**: Unlimited
- Custom branding

### Phase 4: Enterprise
- White-label deployments
- API access
- Team collaboration
- SSO support

## 💡 Use Cases

### Personal Portfolio (Current)
- Case study presentations
- Project documentation
- Design portfolios
- Resume showcases

### SaaS Potential
- **Agencies**: Client presentations
- **Educators**: Course materials
- **Publishers**: Magazine previews
- **Real Estate**: Property brochures
- **Consultants**: Proposals & reports

## 🤝 Contributing

This is currently a personal portfolio project, but contributions welcome!

1. Fork the repo
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit PR

## 📄 License

MIT License - Use for personal or commercial projects

## 🙏 Acknowledgments

- **react-pageflip** - Page turning library
- **PDF.js** - Mozilla's PDF renderer
- **Sharp** - High-performance image processing
- **Vercel** - Hosting and Blob storage
- **Supabase** - Database and auth

---

**Built with:** Next.js 14 • React • TypeScript • Supabase • Vercel

**Status:** ✅ MVP Complete - Ready for Production

**Next:** Deploy and test with real case studies, then evaluate SaaS potential

---

For questions or support, see [docs/flipbook-setup-guide.md](docs/flipbook-setup-guide.md)
