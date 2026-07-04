@echo off
REM Quick deployment checklist script for Windows

echo ================================
echo.
echo 🚀 Deployment Checklist
echo.
echo ================================

REM Check 1: Git status
echo.
echo ✓ Check 1: Git Status
for /f %%i in ('git status --porcelain ^| find /c /v ""') do set count=%%i
if %count% gtr 0 (
    echo   ⚠️  You have uncommitted changes!
    echo   💡 Run: git add . and git commit -m 'Deploy update'
) else (
    echo   ✅ Git is clean
)

REM Check 2: requirements.txt exists
echo.
echo ✓ Check 2: requirements.txt
if exist "requirements.txt" (
    echo   ✅ Found
) else (
    echo   ❌ Missing! Run: pip freeze ^> requirements.txt
)

REM Check 3: .env.example exists
echo.
echo ✓ Check 3: .env.example
if exist ".env.example" (
    echo   ✅ Found
) else (
    echo   ❌ Missing!
)

REM Check 4: Check .env is in .gitignore
echo.
echo ✓ Check 4: .env not tracked
git ls-files ^| findstr /i ".env$" >nul
if errorlevel 1 (
    echo   ✅ .env is ignored
) else (
    echo   ❌ .env is tracked in git!
    echo   💡 Run: git rm --cached .env
)

echo.
echo ================================
echo.
echo 📋 Ready to deploy?
echo.
echo ================================
echo.
echo Next steps:
echo 1. Verify all checks above are ✅
echo 2. Read DEPLOY_GUIDE.md
echo 3. Setup Vercel ^& Render accounts
echo 4. Follow the guide step-by-step
echo.
pause
