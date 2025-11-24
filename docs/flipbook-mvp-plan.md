# Flipbook MVP Build Plan

## MVP Scope (Week 1-2 Launch)

### Included Features
✅ PDF upload only (drag & drop)
✅ Automatic PDF-to-images conversion
✅ Desktop flipbook viewer with page turning
✅ Mobile swipe viewer
✅ Basic document management (list, view, delete)
✅ Public shareable links
✅ Integration with Voiceflow adventure

### Excluded (Post-MVP)
❌ .doc/.pptx conversion (manual conversion required)
❌ Analytics dashboard
❌ Advanced metadata editing
❌ Bulk operations
❌ User authentication (admin only initially)
❌ SEO optimization

---

## SaaS Extension Roadmap

### Phase 2: SaaS Foundation
- Multi-tenant architecture
- User authentication & authorization
- Subscription tiers
- Usage limits & quotas
- White-label options

### Phase 3: Advanced Features
- Document analytics
- Custom branding
- Embed codes for external sites
- API access for integrations
- Team collaboration

### Phase 4: Monetization
- Freemium model (5 docs free)
- Pro tier ($19/month - 100 docs)
- Business tier ($99/month - unlimited)
- Enterprise (custom pricing)

**Potential Market:** Designers, agencies, consultants, educators, publishers

---

## Tech Stack (MVP)

### Frontend
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- react-pageflip (desktop)
- Swiper (mobile)
- Shadcn/ui components

### Backend
- Next.js API Routes
- Vercel Serverless Functions
- Vercel Blob Storage

### Database
- Supabase (PostgreSQL)
- Row Level Security (ready for multi-tenant)

### Processing
- pdf.js (client-side preview)
- Sharp + Canvas (server-side conversion)

---

## Development Timeline

### Day 1-2: Database & Storage
- Set up Supabase schema
- Configure Vercel Blob
- Create storage helpers

### Day 3-4: Upload & Processing
- Build admin upload interface
- Implement PDF processing pipeline
- Test with sample documents

### Day 5-6: Viewer Components
- Desktop flipbook viewer
- Mobile swipe viewer
- Navigation controls

### Day 7: Integration & Testing
- Voiceflow integration
- End-to-end testing
- Deploy to Vercel

---

## MVP Success Metrics

1. **Technical**: Successfully convert & display PDF in <10 seconds
2. **UX**: Smooth page turning on desktop, swipe on mobile
3. **Integration**: Seamless trigger from Voiceflow adventure
4. **Performance**: Pages load in <2 seconds
5. **Mobile**: Fully responsive and usable on phones

If these are met, we proceed with SaaS features.

---

## File Structure

```
portfolio/
├── app/
│   ├── admin/
│   │   └── flipbooks/
│   │       ├── page.tsx              # Document library
│   │       └── new/page.tsx          # Upload page
│   ├── flipbook/
│   │   └── [slug]/page.tsx           # Public viewer
│   └── api/
│       └── flipbooks/
│           ├── upload/route.ts       # Upload + process
│           └── [id]/route.ts         # Get document data
├── components/
│   └── flipbook/
│       ├── FlipbookViewer.tsx        # Desktop viewer
│       ├── MobileViewer.tsx          # Mobile viewer
│       └── UploadZone.tsx            # Upload UI
└── lib/
    ├── flipbook/
    │   ├── processor.ts              # PDF processing
    │   ├── storage.ts                # Blob storage
    │   └── db.ts                     # Database queries
    └── supabase/
        └── schema.sql                # Database schema
```

---

## Next: Execute
Starting with database schema setup...
