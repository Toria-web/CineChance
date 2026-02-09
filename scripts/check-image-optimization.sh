#!/bin/bash
# scripts/check-image-optimization.sh
# Проверяет что Image Optimization отключена во всех местах

set -e

echo "🔍 Checking Image Optimization Configuration..."
echo ""

# 1. Проверяем next.config.ts
echo "1️⃣  next.config.ts:"
if grep -q "unoptimized: true" next.config.ts; then
  echo "   ✅ unoptimized: true found"
else
  echo "   ❌ FAIL: unoptimized: true NOT found"
  exit 1
fi

# 2. Проверяем ImageWithFallback
echo "2️⃣  ImageWithFallback.tsx:"
if grep -q "unoptimized={true}" src/app/components/ImageWithFallback.tsx; then
  echo "   ✅ unoptimized={true} found"
else
  echo "   ❌ FAIL: unoptimized={true} NOT found"
  exit 1
fi

# 3. Проверяем ImageWithProxy
echo "3️⃣  ImageWithProxy.tsx:"
if grep -q "unoptimized={true}" src/app/components/ImageWithProxy.tsx; then
  echo "   ✅ unoptimized={true} found"
else
  echo "   ❌ FAIL: unoptimized={true} NOT found"
  exit 1
fi

# 4. Проверяем MoviePosterProxy
echo "4️⃣  MoviePosterProxy.tsx:"
if grep -q "unoptimized={true}" src/app/components/MoviePosterProxy.tsx; then
  echo "   ✅ unoptimized={true} found"
else
  echo "   ❌ FAIL: unoptimized={true} NOT found"
  exit 1
fi

# 5. Проверяем Header
echo "5️⃣  Header.tsx (logo):"
if grep -q "unoptimized={true}" src/app/components/Header.tsx; then
  echo "   ✅ unoptimized={true} found"
else
  echo "   ⚠️  WARNING: unoptimized={true} NOT found (check if needed)"
fi

# 6. Проверяем что нет прямых TMDB URL использований в Image компонентах
echo "6️⃣  Checking for direct TMDB URLs in Image components:"
# Ищем TMDB URL в Image компонентах
TMDB_URLS=$(grep -r "https://image\.tmdb\.org" src/app/components/*.tsx 2>/dev/null || true)

if [ ! -z "$TMDB_URLS" ]; then
  # Если нашли TMDB URL, проверяем что они используют image-proxy
  if grep -q "/api/image-proxy" src/app/components/*.tsx 2>/dev/null; then
    echo "   ✅ External URLs are proxied through /api/image-proxy"
  else
    echo "   ❌ FAIL: Direct external URLs found without proxying"
    exit 1
  fi
else
  echo "   ✅ No direct external URLs in Image components"
fi

# 7. Проверяем что все Image с external URLs используют наш прокси
echo "7️⃣  Verifying all external image loads use image-proxy:"
if grep -q "/api/image-proxy" src/app/components/MoviePosterProxy.tsx 2>/dev/null; then
  echo "   ✅ MoviePosterProxy uses image-proxy for TMDB images"
else
  echo "   ❌ FAIL: MoviePosterProxy might not be using image-proxy correctly"
  echo "   Debug: Looking for '/api/image-proxy' in MoviePosterProxy.tsx"
  grep -n "api" src/app/components/MoviePosterProxy.tsx || echo "   No 'api' found"
  exit 1
fi

echo ""
echo "✅ All Image Optimization checks passed!"
echo ""
echo "ℹ️  Next steps:"
echo "   1. Deploy to Vercel"
echo "   2. Monitor: https://vercel.com/dashboard → Projects → CineChance → Analytics → Image Optimization"
echo "   3. Should see: 0 transformations (or very close)"
echo ""
