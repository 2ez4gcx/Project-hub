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
rem Doc cong tu data\.env neu co (dong PORT=...), mac dinh 3000
set APPPORT=3000
for /f "tokens=2 delims==" %%a in ('findstr /b "PORT=" "data\.env" 2^>nul') do set APPPORT=%%a
rem Co chung chi trong data\tls thi may chu chay HTTPS -> mo dung dia chi https
if exist "data\tls\server.pfx" (
  start "" https://localhost:%APPPORT%
) else if exist "data\tls\cert.pem" (
  start "" https://localhost:%APPPORT%
) else (
  start "" http://localhost:%APPPORT%
)
node server.js
pause
