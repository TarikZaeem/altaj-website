@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies, please wait...
  call npm install
)
echo Starting the site... keep this window open while you browse.
call npm run dev -- --open
pause
