# Railway Deployment Guide for Flipbook Portfolio

This guide will help you deploy your flipbook portfolio system to Railway, which supports the native dependencies (@napi-rs/canvas and sharp) required for PDF processing.

## Why Railway?

- ✅ Supports native Node.js dependencies (canvas, sharp)
- ✅ Automatic GitHub deployments
- ✅ $5/month starter plan with generous free tier
- ✅ Environment variable management like Vercel
- ✅ Built-in metrics and logging
- ✅ No cold starts for background jobs

## Step-by-Step Setup

### 1. Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with your GitHub account
3. Authorize Railway to access your repositories

### 2. Create New Project

1. Click "New Project" in Railway dashboard
2. Select "Deploy from GitHub repo"
3. Choose your `portfolio` repository
4. Railway will automatically detect it's a Next.js project

### 3. Configure Environment Variables

In your Railway project settings, add these environment variables from your `.env.local` file:

**Supabase Configuration:**
```
NEXT_PUBLIC_SUPABASE_URL=https://xdzaqafffixglhjfwqsy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkemFxYWZmZml4Z2xoamZ3cXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzA3NjQsImV4cCI6MjA3OTA0Njc2NH0.Pz5YZfedcgKiBIKPnZPIgtQJsufyMdnXgMPS9Yw-sag
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkemFxYWZmZml4Z2xoamZ3cXN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ3MDc2NCwiZXhwIjoyMDc5MDQ2NzY0fQ.E1S4a846J2d8gXOzfBMmQrvD_v-zMsL2QuRxbYmE9cc
```

**Inngest Configuration:**
```
INNGEST_EVENT_KEY=Tiio0R3WyqpwrRnkB-mNls7pvBbnZWMiYjkt5QK46K5vXrR7lcAvzl4InTTgbOcEazHVrvg8B6yGoMhUqf9Lpw
INNGEST_SIGNING_KEY=lsignkey-prod-fc4f71da9d0a2b98d8baf5438363bb8e660dd3c50fa4885f58853265d019d748
```

**Important:** Set `NODE_ENV=production` (Railway usually sets this automatically)

### 4. Update Inngest Event URL

After your Railway deployment is live, you need to tell Inngest where to send events:

1. Get your Railway deployment URL (e.g., `https://portfolio-production-xxxx.up.railway.app`)
2. Go to [Inngest Dashboard](https://www.inngest.com/dashboard)
3. Navigate to your app settings
4. Update the webhook URL to: `https://your-railway-url.up.railway.app/api/inngest`
5. Click "Sync" to register your functions

### 5. Deploy

1. Railway will automatically start building your project
2. It will install native dependencies (canvas, sharp) during the build
3. Wait for deployment to complete (usually 3-5 minutes)
4. Check the logs to ensure everything is working

### 6. Test PDF Processing

1. Go to your Railway URL + `/admin/flipbooks/new`
2. Upload a test PDF
3. Monitor the deployment logs in Railway dashboard
4. You should see:
   - "📄 Starting PDF processing for document: [id]"
   - "Processing X pages from PDF"
   - "Processed page 1/X", "Processed page 2/X", etc.
   - "✅ Successfully processed document: [id]"
5. View the flipbook at `/flipbook/[slug]`
6. Images should now display correctly!

## Troubleshooting

### Build Fails with Native Dependencies

If you see errors about missing cairo, pango, or other native libraries:
1. Check that `nixpacks.toml` is committed to your repo
2. Verify it includes all required packages
3. Try triggering a fresh deployment

### Inngest Functions Not Running

1. Verify environment variables are set correctly in Railway
2. Check that Inngest webhook URL is configured: `https://your-railway-url.up.railway.app/api/inngest`
3. Go to Inngest dashboard and click "Sync" to re-register functions
4. Check Railway logs for Inngest-related errors

### Images Still Not Displaying

1. Check Railway logs during PDF upload
2. Verify processing completed successfully
3. Check Supabase Storage to see if WebP files were created
4. Use curl to test if files are actual images:
   ```bash
   curl -s "https://[supabase-url]/storage/v1/object/public/flipbooks/[doc-id]/page-0001.webp" | file -
   ```
   Should say "Web/P image" not "PDF document"

### Sharp Module Errors

If you see "Module not found: Can't resolve 'sharp'":
1. SSH into Railway container (if needed): `railway shell`
2. Run: `npm list sharp` to verify it's installed
3. Check that sharp is in `package.json` dependencies (not devDependencies)

## Cost Estimate

**Railway Free Tier:**
- $5 credit per month
- Includes 500 hours of usage
- Should cover portfolio + low-traffic flipbook system

**Paid Plan ($5/month):**
- If you exceed free tier
- $5 gets you plenty of compute for this application
- Pay-as-you-go for usage beyond base plan

**Total Monthly Cost:**
- Railway: $0-5/month
- Supabase: Free tier (likely sufficient)
- Inngest: Free tier (1000 function runs/month)
- **Estimated Total: $0-5/month**

## Next Steps After Deployment

1. **Update Frontend URLs**: If you were using Vercel URLs, update any hardcoded references
2. **Test All Features**:
   - Upload PDFs
   - View flipbooks on desktop
   - Test mobile viewer
   - Check sharing functionality
3. **Monitor Performance**: Use Railway's built-in metrics
4. **Set Up Custom Domain**: Railway supports custom domains (optional)

## Comparing to Vercel

| Feature | Vercel | Railway |
|---------|--------|---------|
| Native dependencies | ❌ No | ✅ Yes |
| Serverless functions | ✅ Yes | ❌ No (long-running) |
| PDF Processing | ❌ Fails | ✅ Works |
| Cost (hobby) | Free | $5/month |
| GitHub integration | ✅ Yes | ✅ Yes |
| Environment vars | ✅ Easy | ✅ Easy |

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Inngest Docs: https://www.inngest.com/docs
