@echo off
echo ========================================
echo Shinde Tractors Desktop App Builder
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Step 1: Build React App
echo Step 1: Building React application...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo React app built successfully!
echo.

REM Step 2: Build Windows Installer
echo Step 2: Creating Windows installer...
call npm run build:win
if errorlevel 1 (
    echo Installer creation failed!
    pause
    exit /b 1
)
echo Installer created successfully!
echo.

echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Your installer is located at:
echo dist-electron\Shinde Tractors Attendance Setup 1.0.0.exe
echo.
echo You can now distribute this installer to users!
echo.

REM Open the dist-electron folder
set /p open="Do you want to open the dist-electron folder? (Y/N): "
if /i "%open%"=="Y" (
    start "" "dist-electron"
)

pause
