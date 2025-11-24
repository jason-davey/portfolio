#!/bin/bash

# Flipbook System Setup Script
# Automates installation and configuration

set -e

echo "=================================="
echo "  Flipbook System Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Node version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}Error: Node.js 18+ required. Current: $(node -v)${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js version OK${NC}"
echo ""

# Step 2: Install npm dependencies
echo "Installing dependencies..."
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

npm install --save-dev \
  @types/react-dropzone

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Check for system dependencies (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "Checking system dependencies (macOS)..."

  if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠ Homebrew not found. Install from https://brew.sh${NC}"
  else
    echo "Installing Cairo, Pango, and image libraries..."
    brew install pkg-config cairo pango libpng jpeg giflib librsvg || true
    echo -e "${GREEN}✓ System dependencies installed${NC}"
  fi
  echo ""
fi

# Step 4: Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
  echo "Creating .env.local from template..."
  cp .env.flipbook.example .env.local
  echo -e "${YELLOW}⚠ Please edit .env.local with your credentials${NC}"
  echo ""
fi

# Step 5: Database setup instructions
echo "=================================="
echo "  Next Steps:"
echo "=================================="
echo ""
echo "1. ${YELLOW}Set up Supabase:${NC}"
echo "   - Go to https://supabase.com"
echo "   - Copy SQL from: supabase/migrations/20250118_flipbook_schema.sql"
echo "   - Run in Supabase SQL Editor"
echo ""
echo "2. ${YELLOW}Configure environment variables:${NC}"
echo "   - Edit .env.local with your Supabase credentials"
echo "   - Add Vercel Blob token (get from Vercel dashboard)"
echo ""
echo "3. ${YELLOW}Start development:${NC}"
echo "   - Run: npm run dev"
echo "   - Visit: http://localhost:3000/admin/flipbooks"
echo ""
echo "4. ${YELLOW}Deploy to Vercel:${NC}"
echo "   - Run: vercel --prod"
echo "   - Configure environment variables in Vercel dashboard"
echo ""
echo -e "${GREEN}Setup script completed!${NC}"
echo ""
echo "For detailed instructions, see: docs/flipbook-setup-guide.md"
