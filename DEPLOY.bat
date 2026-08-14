@echo off
REM ── DEVLORE — double-click to build and deploy ──────────────────────────────
REM Wrapper around deploy.ps1 so it can be launched from Explorer.
REM The window stays open at the end so you can read the result.

cd /d "%~dp0"
echo Running DevLore build ^& deploy...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"
echo.
echo ── Finished. Review the output above. ──
pause
