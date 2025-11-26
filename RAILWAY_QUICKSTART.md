# Railway Deployment - Quick Start

## 1. Create Account & Deploy (5 minutes)

1. **Sign up**: Go to [railway.app](https://railway.app) → Login with GitHub
2. **New Project**: Click "New Project" → "Deploy from GitHub repo" → Select `portfolio`
3. **Railway auto-detects**: Next.js project and starts building

## 2. Add Environment Variables (3 minutes)

In Railway project → Settings → Variables, paste all at once:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xdzaqafffixglhjfwqsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkemFxYWZmZml4Z2xoamZ3cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzA3NjQsImV4cCI6MjA3OTA0Njc2NH0.Pz5YZfedcgKiBIKPnZPIgtQJsufyMdnXgMPS9Yw-sag
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkemFxYWZmZml4Z2xoamZ3cXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3MDc2NCwiZXhwIjoyMDc5MDQ2NzY0fQ.E1S4a846J2d8gXOzfBMmQrvD_v-zMsL2QuRxbYmE9cc
INNGEST_EVENT_KEY=Tiio0R3WyqpwrRnkB-mNls7pvBbnZWMiYjkt5QK46K5vXrR7lcAvzl4InTTgbOcEazHVrvg8B6yGoMhUqf9Lpw
INNGEST_SIGNING_KEY=lsignkey-prod-fc4f71da9d0a2b98d8baf5438363bb8e660dd3c50fa4885f58853265d019d748
NODE_ENV=production
```

Click "Add" → Railway will redeploy automatically

## 3. Configure Inngest (2 minutes)

After deployment finishes:

1. **Get Railway URL**: Copy from Railway dashboard (e.g., `https://portfolio-production-abc123.up.railway.app`)
2. **Go to Inngest**: [inngest.com/dashboard](https://www.inngest.com/dashboard)
3. **Update webhook**: Settings → Sync URL → `https://your-railway-url.up.railway.app/api/inngest`
4. **Click "Sync"** to register functions

## 4. Test PDF Upload (3 minutes)

1. Go to: `https://your-railway-url.up.railway.app/admin/flipbooks/new`
2. Upload a PDF
3. Watch Railway logs (Deployments → View Logs):
   ```
   📄 Starting PDF processing for document: xxx
   Processing 7 pages from PDF
   Processed page 1/7
   Processed page 2/7
   ...
   ✅ Successfully processed document: xxx
   ```
4. View flipbook: `https://your-railway-url.up.railway.app/flipbook/[slug]`
5. **Images should now display correctly!** 🎉

## 5. Verify Fix (1 minute)

Check that files are real images:

```bash
curl -s "https://[supabase-url]/storage/v1/object/public/flipbooks/[doc-id]/page-0001.webp" | file -
```

Should say: **"Web/P image data"** ✅
NOT: "PDF document" ❌

---

## Troubleshooting

**Build fails**: Check Railway logs for native dependency errors
**Images still broken**: Verify Inngest webhook URL is correct and click "Sync"
**Functions not running**: Check environment variables are set correctly

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed troubleshooting.

---

## Total Time: ~15 minutes
## Cost: $0-5/month (likely free tier sufficient for portfolio)
