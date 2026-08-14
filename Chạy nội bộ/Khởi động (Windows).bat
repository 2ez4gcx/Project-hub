@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Chua cai dat Node.js tren may nay.
  echo  1^) Mo trang  https://nodejs.org
  echo  2^) Tai ban "LTS", cai dat ^(bam Next den khi xong^).
  echo  3^) Chay lai file nay.
  echo.
  pause
  exit /b
)
echo Dang khoi dong Tram Du An...
start "" http://localhost:3000
node server.js
pause
