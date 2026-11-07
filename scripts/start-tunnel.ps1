# Smartlink WiFi — Omada Tunnel Auto-Start Script
# Run this script whenever you start the system
# It starts the Cloudflare tunnel and updates the OMADA_BASE_URL automatically

Write-Host "Starting Smartlink WiFi Omada Tunnel..." -ForegroundColor Green

# Start cloudflared and capture the URL
$tunnelUrl = $null
$process = Start-Process -FilePath "cloudflared" `
  -ArgumentList "tunnel --url https://127.0.0.1:8043 --no-tls-verify" `
  -RedirectStandardOutput "$env:TEMP\cloudflared-out.txt" `
  -RedirectStandardError "$env:TEMP\cloudflared-err.txt" `
  -PassThru -NoNewWindow

Write-Host "Tunnel process started (PID: $($process.Id))" -ForegroundColor Yellow
Write-Host "Waiting for tunnel URL..." -ForegroundColor Yellow

# Wait up to 30 seconds for the URL to appear
$elapsed = 0
while ($elapsed -lt 30) {
  Start-Sleep -Seconds 2
  $elapsed += 2
  
  $log = Get-Content "$env:TEMP\cloudflared-err.txt" -ErrorAction SilentlyContinue
  $urlLine = $log | Select-String "trycloudflare.com" | Select-Object -Last 1
  
  if ($urlLine) {
    $tunnelUrl = ($urlLine -replace '.*\|\s*', '' -replace '\s*\|.*', '').Trim()
    if ($tunnelUrl -match "https://.*trycloudflare\.com") {
      $tunnelUrl = [regex]::Match($tunnelUrl, "https://[a-z0-9-]+\.trycloudflare\.com").Value
      break
    }
  }
}

if (-not $tunnelUrl) {
  Write-Host "ERROR: Could not get tunnel URL. Check cloudflared is installed." -ForegroundColor Red
  exit 1
}

Write-Host "`nTunnel URL: $tunnelUrl" -ForegroundColor Cyan

# Update .env.local with new OMADA_BASE_URL
$envFile = "d:\WifI\.env.local"
$content = Get-Content $envFile -Raw
$newContent = $content -replace 'OMADA_BASE_URL=".*"', "OMADA_BASE_URL=`"$tunnelUrl`""
[System.IO.File]::WriteAllText($envFile, $newContent)
Write-Host "Updated .env.local with new tunnel URL" -ForegroundColor Green

# Restart the dev server if running
$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
  Write-Host "Restarting Next.js dev server..." -ForegroundColor Yellow
  $nodeProcs | Stop-Process -Force
  Start-Sleep -Seconds 3
}

# Start Next.js dev server
Start-Process -FilePath "powershell" `
  -ArgumentList "-Command cd d:\WifI; npm run dev" `
  -NoNewWindow

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host " Smartlink WiFi System Started!" -ForegroundColor Green  
Write-Host "==========================================" -ForegroundColor Green
Write-Host " Portal:     https://smartlink-wifi.vercel.app/portal" -ForegroundColor Cyan
Write-Host " Admin:      https://smartlink-wifi.vercel.app/auth/login" -ForegroundColor Cyan
Write-Host " Local:      http://localhost:3000" -ForegroundColor Cyan
Write-Host " Omada API:  $tunnelUrl" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
Write-Host "`nDO NOT close this window - tunnel is running" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

# Keep script running
Wait-Process -Id $process.Id
