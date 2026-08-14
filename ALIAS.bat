@echo off
REM ===========================================================================
REM DEVLORE - Point devloreapp.vercel.app at the current production deployment.
REM
REM The deploy succeeded but the devloreapp.vercel.app alias was still bound to
REM an older deployment, so visitors kept seeing the previous build.
REM This repoints it. Reversible: re-run "vercel alias set <old-url> devloreapp.vercel.app".
REM ===========================================================================

cd /d "%~dp0"
set REPORT=%~dp0alias-report.txt

echo DEVLORE ALIAS UPDATE > "%REPORT%"
echo Generated: %DATE% %TIME% >> "%REPORT%"
echo. >> "%REPORT%"

echo ===== before ===== >> "%REPORT%"
call npx vercel alias ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== setting devloreapp.vercel.app to devlore-1v8y3voq9 ===== >> "%REPORT%"
call npx vercel alias set devlore-1v8y3voq9-dev-lore1.vercel.app devloreapp.vercel.app >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== after ===== >> "%REPORT%"
call npx vercel alias ls >> "%REPORT%" 2>&1
echo. >> "%REPORT%"

echo ===== END ===== >> "%REPORT%"
echo Alias update written to alias-report.txt
