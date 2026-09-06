@echo off
chcp 65001 >nul
setlocal
rem ============================================================
rem  TRẠM DỰ ÁN — CẬP NHẬT LÊN BẢN MỚI NHẤT (Windows)
rem  1. Sao lưu thư mục data  ->  data-saoluu-YYYYMMDD-HHMM
rem  2. Tải gói mới nhất từ GitHub Releases
rem  3. Chép đè mã chương trình (KHÔNG đụng thư mục data)
rem  4. Nhắc khởi động lại
rem  Cần: Windows 10/11 (có sẵn curl và PowerShell). Chạy bằng cách nhấp đúp.
rem ============================================================
cd /d "%~dp0"
set "URL=https://github.com/2ez4gcx/Project-hub/releases/latest/download/tram-du-an-noi-bo.zip"
set "TMP=%TEMP%\tram-du-an-capnhat"
for /f "tokens=1-4 delims=/:. " %%a in ("%date% %time%") do set "STAMP=%%c%%b%%a-%%d"
set "STAMP=%STAMP: =0%"

echo.
echo  ===== TRẠM DỰ ÁN — CẬP NHẬT PHIÊN BẢN =====
echo.
if exist data (
  echo  [1/4] Sao lưu thư mục data -> data-saoluu-%STAMP% ...
  xcopy /e /i /q /y data "data-saoluu-%STAMP%" >nul
  if errorlevel 1 ( echo  LỖI: không sao lưu được thư mục data. Dừng lại. & pause & exit /b 1 )
) else (
  echo  [1/4] Chưa có thư mục data (bản mới cài) — bỏ qua sao lưu.
)

echo  [2/4] Tải gói mới nhất ...
if exist "%TMP%" rmdir /s /q "%TMP%"
mkdir "%TMP%"
curl -L --fail --silent --show-error -o "%TMP%\goi.zip" "%URL%"
if errorlevel 1 ( echo  LỖI: không tải được. Kiểm tra mạng, hoặc tải tay từ https://github.com/2ez4gcx/Project-hub/releases & pause & exit /b 1 )

echo  [3/4] Giải nén và chép đè mã chương trình (giữ nguyên data) ...
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%TMP%\goi.zip' -DestinationPath '%TMP%\ra' -Force"
if errorlevel 1 ( echo  LỖI: không giải nén được. & pause & exit /b 1 )
if exist "%TMP%\ra\data" rmdir /s /q "%TMP%\ra\data"
xcopy /e /i /q /y "%TMP%\ra\*" "." >nul
if errorlevel 1 ( echo  LỖI: không chép đè được. Bản sao lưu vẫn còn ở data-saoluu-%STAMP%. & pause & exit /b 1 )
rmdir /s /q "%TMP%"

echo  [4/4] Xong. Phiên bản mới:
findstr /c:"\"version\"" package.json
echo.
echo  Hãy ĐÓNG cửa sổ máy chủ đang chạy rồi nhấp đúp "Khởi động (Windows).bat" để chạy bản mới.
echo  Bảo mọi người bấm Ctrl+F5 một lần. Bản sao lưu dữ liệu: data-saoluu-%STAMP%
echo.
pause
