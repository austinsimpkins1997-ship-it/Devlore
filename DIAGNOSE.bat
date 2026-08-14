@echo off
REM ===========================================================================
REM DEVLORE - Collect deployment diagnostics into deploy-report.txt
REM Read-only: this script inspects state, it does not change anything.
REM ===========================================================================

cd /d "%~dp0"
set REPORT=%~dp0deploy-report.txt

echo DEVLORE DEPLOYMENT DIAGNOSTICS > "%REPORT%"
echo Generated: %DATE% %TIME% >> "%REPORT%"
echo. >> "%REPORT%"

echo ===== [1] git HEAD ===== >> "%REPORT%"
git log --oneline -3 >> "%REPORT%" 2>&1
echo. >> "%REPORT%"
echo ===== [2] git remote (host only - token deliberately not printed) ===== >> "%REPORT%"
REM Never dump the full remote URL: it embeds a personal access token.
for /f "tokens=2 delims=@" %%H in ('git remote get-url origin') do echo origin -^> %%H >> "%REPORT%"
echo. >> "%REPORT%"

echo ===== [3] vercel whoami ===== >> "%REPORT%"
call npx vercel whoami >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [4] vercel projects ===== >> "%REPORT%"
call npx vercel project ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [5] recent deployments ===== >> "%REPORT%"
call npx vercel ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [6] domains on this account ===== >> "%REPORT%"
call npx vercel domains ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [7] aliases ===== >> "%REPORT%"
call npx vercel alias ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [8] inspect latest production deployment ===== >> "%REPORT%"
call npx vercel inspect https://devlore-lv8y3voq9-dev-lore1.vercel.app >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== [9] build logs for that deployment ===== >> "%REPORT%"
call npx vercel inspect https://devlore-lv8y3voq9-dev-lore1.vercel.app --logs >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== END OF REPORT ===== >> "%REPORT%"

echo Diagnostics written to deploy-report.txt
