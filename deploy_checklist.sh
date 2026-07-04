#!/bin/bash
# Quick deployment checklist script

echo "================================"
echo "🚀 Deployment Checklist"
echo "================================"

# Check 1: Git status
echo ""
echo "✓ Check 1: Git Status"
if git status --porcelain | grep -q .; then
    echo "  ⚠️  You have uncommitted changes!"
    echo "  💡 Run: git add . && git commit -m 'Deploy update'"
else
    echo "  ✅ Git is clean"
fi

# Check 2: requirements.txt exists
echo ""
echo "✓ Check 2: requirements.txt"
if [ -f "requirements.txt" ]; then
    echo "  ✅ Found"
else
    echo "  ❌ Missing! Run: pip freeze > requirements.txt"
fi

# Check 3: .env.example exists
echo ""
echo "✓ Check 3: .env.example"
if [ -f ".env.example" ]; then
    echo "  ✅ Found"
else
    echo "  ❌ Missing!"
fi

# Check 4: frontend build test
echo ""
echo "✓ Check 4: Frontend Build"
cd frontend
if npm run build > /dev/null 2>&1; then
    echo "  ✅ Build successful"
    rm -rf dist
else
    echo "  ❌ Build failed! Fix errors before deploying"
fi
cd ..

# Check 5: .env not in git
echo ""
echo "✓ Check 5: .env not tracked"
if git ls-files | grep -q "\.env$"; then
    echo "  ❌ .env is tracked in git!"
    echo "  💡 Run: git rm --cached .env"
else
    echo "  ✅ .env is ignored"
fi

echo ""
echo "================================"
echo "📋 Ready to deploy?"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Verify all checks above are ✅"
echo "2. Read DEPLOY_GUIDE.md"
echo "3. Setup Vercel & Render accounts"
echo "4. Follow the guide step-by-step"
echo ""
