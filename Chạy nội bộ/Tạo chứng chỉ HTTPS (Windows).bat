@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Dang tao chung chi HTTPS tu ky cho may nay (dung cong cu co san cua Windows)...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ips = @(Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike '169.*' -and $_.IPAddress -ne '127.0.0.1' } | Select-Object -ExpandProperty IPAddress); $names = @('localhost') + $ips + @($env:COMPUTERNAME); Write-Host ('  Chung chi cap cho: ' + ($names -join ', ')); $cert = New-SelfSignedCertificate -DnsName $names -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(5) -FriendlyName 'Tram Du An HTTPS'; New-Item -ItemType Directory -Force 'data\tls' | Out-Null; Export-PfxCertificate -Cert $cert -FilePath 'data\tls\server.pfx' -Password (ConvertTo-SecureString 'tramduan' -AsPlainText -Force) | Out-Null; Write-Host '  OK: da luu data\tls\server.pfx'"
if errorlevel 1 (
  echo.
  echo  Co loi khi tao chung chi. Hay chay lai file nay bang chuot phai ^> Run as administrator,
  echo  hoac xem huong dan trong "BAO MAT - Bat HTTPS (noi bo).txt".
) else (
  echo.
  echo  XONG! Khoi dong lai Tram Du An ^(dong cua so may chu roi chay lai file Khoi dong^).
  echo  Tu gio vao phan mem bang dia chi  https://...  ^(trinh duyet canh bao chung chi
  echo  tu ky la binh thuong — bam Nang cao ^> Tiep tuc^).
)
echo.
pause
