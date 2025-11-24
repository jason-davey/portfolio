#!/bin/bash

# Start Flipbook System on Port 4000

echo "🚀 Starting Flipbook System..."
echo ""

# Check if port 4000 is in use
if lsof -ti:4000 > /dev/null 2>&1; then
  echo "⚠️  Port 4000 is already in use"
  echo "Killing existing process..."
  kill -9 $(lsof -ti:4000)
  sleep 2
fi

echo "✓ Port 4000 is available"
echo ""
echo "Starting Next.js on http://localhost:4000"
echo ""
echo "Access points:"
echo "  • Homepage:  http://localhost:4000"
echo "  • Admin:     http://localhost:4000/admin/flipbooks"
echo "  • Viewer:    http://localhost:4000/flipbook/[slug]"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npx next dev -p 4000
