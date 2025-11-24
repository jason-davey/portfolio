# Flipbook System - Port 4000 Configuration

Your main portfolio runs on Vite (default port 5173). The flipbook system is built with Next.js and needs its own port.

## Two Options:

### Option 1: Run Flipbook on Port 4000 (Recommended)

Configure Next.js to run on port 4000:

1. **Create/Update `package.json` in flipbook directory:**

```json
{
  "scripts": {
    "dev:flipbook": "next dev -p 4000",
    "build:flipbook": "next build",
    "start:flipbook": "next start -p 4000"
  }
}
```

2. **Access points:**
   - Main portfolio (Vite): http://localhost:5173
   - Flipbook admin: http://localhost:4000/admin/flipbooks
   - Flipbook viewer: http://localhost:4000/flipbook/[slug]

### Option 2: Integrate into Existing Vite App

Convert the flipbook to work with your Vite/React setup (requires more work).

---

## Recommended Setup: Separate Next.js App

Since the flipbook has different requirements (server-side processing), I recommend:

**Architecture:**
```
Main Portfolio (Vite on :5173)
    │
    └──> Links to ──> Flipbook App (Next.js on :4000)
                      for PDF viewing
```

**Benefits:**
- Separate concerns
- Independent deployment
- No conflicts
- Easier to maintain
