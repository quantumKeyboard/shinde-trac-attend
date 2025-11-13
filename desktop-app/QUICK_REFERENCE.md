# Quick Reference: Creating Desktop App Installer

## 🎯 To Create the Installer (Choose One Method)

### Method 1: Double-click the batch file
```
build-installer.bat
```

### Method 2: Run PowerShell script
```powershell
.\build-installer.ps1
```

### Method 3: Manual commands
```bash
npm run build
npm run build:win
```

## 📍 Where to Find the Installer

After building, look for:
```
desktop-app/dist-electron/Shinde Tractors Attendance Setup 1.0.0.exe
```

## ✅ What's Been Fixed

1. **DevTools Issue** - DevTools no longer open in production
2. **Installer Setup** - Proper Windows installer with:
   - Custom install location
   - Desktop shortcut
   - Start Menu entry
   - License agreement

## 📦 Installer Features

When users install:
- ✅ Choose installation directory
- ✅ Desktop shortcut created
- ✅ Start Menu shortcut created
- ✅ Easy uninstall option
- ✅ Professional installer UI

## 🔄 To Update the App

1. Make your code changes
2. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```
3. Run build script again
4. New installer will be `Setup 1.0.1.exe`

## 📋 Prerequisites (One-time)

Before first build:
```bash
npm install
```

## ⚠️ Important Notes

- **Build time**: First build takes 2-5 minutes
- **File size**: Installer is ~80-120 MB
- **Requirements**: Node.js must be installed
- **Distribution**: The .exe can be shared with anyone

## 🎨 Optional: Add App Icon

1. Create/get a 256x256 PNG logo
2. Convert to `.ico`: https://icoconvert.com/
3. Save as `build/icon.ico`
4. Uncomment icon lines in:
   - `package.json` (line ~45)
   - `electron/main.cjs` (line ~14)
5. Rebuild

## 🚀 Ready to Build?

Run one of the build methods above, and you'll have a distributable installer in minutes!
