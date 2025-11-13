@echo off
echo ============================================
echo Creating Portable Distribution Package
echo ============================================
echo.

REM Check if 7-Zip is installed
set "SEVENZIP=C:\Program Files\7-Zip\7z.exe"
if not exist "%SEVENZIP%" (
    set "SEVENZIP=C:\Program Files (x86)\7-Zip\7z.exe"
)

REM Check if the unpacked app exists
if not exist "dist-electron\win-unpacked" (
    echo ERROR: Unpacked app not found!
    echo Please run: npm run build
    pause
    exit /b 1
)

echo Creating portable ZIP package...
echo.

REM Use PowerShell to create zip (works on all Windows 10+)
powershell -Command "Compress-Archive -Path 'dist-electron\win-unpacked\*' -DestinationPath 'dist-electron\Shinde-Tractors-Attendance-Portable.zip' -Force"

if errorlevel 1 (
    echo Failed to create ZIP!
    pause
    exit /b 1
)

echo.
echo ============================================
echo SUCCESS!
echo ============================================
echo.
echo Portable package created at:
echo dist-electron\Shinde-Tractors-Attendance-Portable.zip
echo.
echo Users can:
echo 1. Extract the ZIP file
echo 2. Run "Shinde Tractors Attendance.exe"
echo.
echo File size: ~150-200 MB (includes everything)
echo.

set /p open="Open dist-electron folder? (Y/N): "
if /i "%open%"=="Y" (
    start "" "dist-electron"
)

pause
