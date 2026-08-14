@echo off
setlocal enabledelayedexpansion
REM ===========================================================================
REM DEVLORE - One-click ship: migrate, build, push, deploy, and re-alias.
REM
REM This replaces the DEPLOY -> VERCEL-DEPLOY -> ALIAS sequence. The alias step
REM matters: every "vercel deploy --prod" creates a NEW deployment URL, and
REM devloreapp.vercel.app does not follow it automatically. Forgetting that is
REM why the live site previously kept serving an old build.
REM
REM Output is written to ship-report.txt (gitignored) as well as this window.
REM ===========================================================================

cd /d "%~dp0"
set REPORT=%~dp0ship-report.txt
set DOMAIN=devloreapp.vercel.app

echo DEVLORE SHIP > "%REPORT%"
echo Started: %DATE% %TIME% >> "%REPORT%"

echo.
echo [1/6] prisma generate
call npx prisma generate >> "%REPORT%" 2>&1
if errorlevel 1 goto :failed

echo [2/6] prisma db push  (adds User.charEyes, User.charMarking)
call npx prisma db push >> "%REPORT%" 2>&1
if errorlevel 1 goto :failed

echo [3/6] next build
call npm run build >> "%REPORT%" 2>&1
if errorlevel 1 goto :failed

echo [4/6] git commit and push
git add -A >> "%REPORT%" 2>&1
git commit -m "fix: settings crash (useSession without SessionProvider); add inventory tab, working upgrades, account sync, expanded character models" >> "%REPORT%" 2>&1
git push origin master >> "%REPORT%" 2>&1

echo [5/6] vercel deploy --prod
set DEPLOY_URL=
for /f "usebackq delims=" %%i in (`npx vercel deploy --prod --yes 2^>nul`) do set "DEPLOY_URL=%%i"
echo Deployment URL: !DEPLOY_URL! >> "%REPORT%"
if "!DEPLOY_URL!"=="" goto :failed
echo     -^> !DEPLOY_URL!

echo [6/6] pointing %DOMAIN% at the new deployment
call npx vercel alias set !DEPLOY_URL! %DOMAIN% >> "%REPORT%" 2>&1
if errorlevel 1 goto :failed

echo. >> "%REPORT%"
echo ===== final aliases ===== >> "%REPORT%"
call npx vercel alias ls >> "%REPORT%" 2>&1

echo.
echo SUCCESS - https://%DOMAIN% now serves !DEPLOY_URL!
echo SUCCESS >> "%REPORT%"
goto :done

:failed
echo.
echo FAILED - see ship-report.txt for the full output.
echo FAILED >> "%REPORT%"

:done
echo.
echo Full log: ship-report.txt
pause
endlocal
