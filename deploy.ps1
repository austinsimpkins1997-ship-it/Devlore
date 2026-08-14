# =============================================================================
# DEVLORE - Build and Deploy
#
# Run from the project root:
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
# or just double-click DEPLOY.bat
#
# Steps:
#   1. prisma generate   - regenerate the client for the new models
#   2. prisma db push    - add new tables/columns to the database
#                          (ADDITIVE ONLY: new tables plus new columns with
#                           defaults. No existing column is dropped or
#                           retyped, so existing rows are preserved.)
#   3. next build        - full production build; fails loudly on errors
#   4. git commit + push - pushes to origin/master
#
# If Vercel is connected to this GitHub repo, step 4 triggers the deployment.
# If not, run "npx vercel --prod" afterward.
#
# NOTE: This file is intentionally plain ASCII. Windows PowerShell 5.1 reads
# .ps1 files as ANSI, so non-ASCII characters (em dashes, box drawing, smart
# quotes) corrupt the parse. Do not add them.
# =============================================================================

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

function Write-Step($n, $msg) { Write-Host ""; Write-Host "[$n] $msg" -ForegroundColor Cyan }
function Write-Ok($msg)       { Write-Host "    OK: $msg" -ForegroundColor Green }
function Write-Note($msg)     { Write-Host "    !  $msg" -ForegroundColor Yellow }

Write-Host "DEVLORE - build and deploy" -ForegroundColor Magenta

try {
    # -- Preflight ------------------------------------------------------------
    Write-Step 0 "Preflight checks"
    if (-not (Test-Path ".\package.json")) { throw "package.json not found. Run this from the project root." }
    if (-not (Test-Path ".\.env"))         { throw ".env not found. DATABASE_URL is required for prisma db push." }
    Write-Ok "project root and .env present"

    # -- 1. Prisma client -----------------------------------------------------
    Write-Step 1 "prisma generate"
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed." }
    Write-Ok "Prisma client regenerated"

    # -- 2. Schema push -------------------------------------------------------
    Write-Step 2 "prisma db push (additive schema changes)"
    Write-Host "    New tables:  ForgeEntry, QuestProgress, Trophy, Kudos, Equipment, Friendship, Message"
    Write-Host "    New columns: User.charBody, charSkin, charHair, charCloak, charAura, charCreated"
    Write-Host "                 Equipment.equipped"
    npx prisma db push
    if ($LASTEXITCODE -ne 0) { throw "prisma db push failed. Check DATABASE_URL in .env." }
    Write-Ok "database schema synced"

    # -- 3. Production build --------------------------------------------------
    Write-Step 3 "next build"
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed. Fix the errors above before deploying." }
    Write-Ok "production build succeeded"

    # -- 4. Commit and push ---------------------------------------------------
    Write-Step 4 "git commit and push"
    git add -A
    $status = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Note "no changes to commit - working tree already clean"
    } else {
        git commit -m "feat: quests, trophies, leaderboard, equipment, badges, fellowship, character creator, multi-provider AI"
        if ($LASTEXITCODE -ne 0) { throw "git commit failed." }
        Write-Ok "changes committed"
    }

    git push origin master
    if ($LASTEXITCODE -ne 0) { throw "git push failed. Check your credentials or network." }
    Write-Ok "pushed to origin/master"

    Write-Host ""
    Write-Host "SUCCESS - all steps completed." -ForegroundColor Magenta
    Write-Host "If Vercel is connected to this GitHub repo, the deployment is building now." -ForegroundColor Gray
    Write-Host "If it is NOT connected, run:  npx vercel --prod" -ForegroundColor Gray
}
catch {
    Write-Host ""
    Write-Host "FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Nothing further was run. Fix the issue above and run this script again." -ForegroundColor Red
}

Write-Host ""
Write-Host "Remember - .env is gitignored, so these must be set in the Vercel dashboard:" -ForegroundColor Yellow
Write-Host "  Required: AUTH_URL, NEXT_PUBLIC_APP_URL, DATABASE_URL, AUTH_SECRET," -ForegroundColor Gray
Write-Host "            AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, STRIPE_SECRET_KEY," -ForegroundColor Gray
Write-Host "            STRIPE_WEBHOOK_SECRET, CRON_SECRET" -ForegroundColor Gray
Write-Host "  AI (add at least one; more keys = more free headroom):" -ForegroundColor Gray
Write-Host "            GROQ_API_KEY      <- fastest to get, no credit card" -ForegroundColor Gray
Write-Host "            GEMINI_API_KEY    <- must start with AIza" -ForegroundColor Gray
Write-Host "            CEREBRAS_API_KEY, MISTRAL_API_KEY, OPENROUTER_API_KEY" -ForegroundColor Gray
Write-Host "            AI_PROVIDER_ORDER <- optional, e.g. groq,gemini,cerebras" -ForegroundColor Gray
Write-Host "  With zero AI keys the site still works using the built-in fallback writer." -ForegroundColor Gray
Write-Host ""
Write-Host "After deploy: sign in and open /api/ai/status?probe=1 to confirm AI is live." -ForegroundColor Cyan
