@echo off
REM ===========================================================================
REM DEVLORE - Push a production deployment to Vercel directly.
REM
REM Use this when a git push does NOT trigger an automatic Vercel deployment
REM (i.e. the Vercel project is not connected to the GitHub repo).
REM
REM Requires the project to be linked (a .vercel folder must exist) and the
REM Vercel CLI to be logged in. If it asks you to log in, complete the login
REM in this window and run it again.
REM ===========================================================================

cd /d "%~dp0"
echo Deploying DevLore to Vercel production...
echo.
call npx vercel deploy --prod --yes
echo.
echo == Deploy command finished. Review the output above. ==
echo If it printed a Production URL, the deployment succeeded.
pause
