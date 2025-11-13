# Build Windows Installer for Shinde Tractors Desktop App

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Shinde Tractors Desktop App Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Step 1: Build React App
Write-Host "Step 1: Building React application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "React app built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Build Windows Installer
Write-Host "Step 2: Creating Windows installer..." -ForegroundColor Yellow
npm run build:win
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installer creation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Installer created successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Show results
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BUILD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your installer is located at:" -ForegroundColor Yellow
Write-Host "dist-electron\Shinde Tractors Attendance Setup 1.0.0.exe" -ForegroundColor White
Write-Host ""
Write-Host "You can now distribute this installer to users!" -ForegroundColor Green
Write-Host ""

# Open the dist-electron folder
$openFolder = Read-Host "Do you want to open the dist-electron folder? (Y/N)"
if ($openFolder -eq "Y" -or $openFolder -eq "y") {
    Start-Process "dist-electron"
}
