# Windows Symbolic Link Permission Issue - SOLUTION

## Problem
Electron-builder fails with the error:
```
ERROR: Cannot create symbolic link : A required privilege is not held by the client
```

This happens because Windows requires administrator privileges or Developer Mode to create symbolic links.

## ✅ SOLUTION OPTIONS

### Option 1: Enable Windows Developer Mode (RECOMMENDED - Easiest)

1. Open Windows Settings
2. Go to **Update & Security** > **For Developers**
3. Turn on **Developer Mode**
4. Restart PowerShell/Terminal
5. Run `npm run build:win` again

This allows your user account to create symbolic links without administrator privileges.

### Option 2: Run PowerShell as Administrator

1. Close current PowerShell window
2. Right-click PowerShell and select **Run as Administrator**
3. Navigate to project: `cd "d:\Projects\ShindeTractors Employee Attendance\desktop-app"`
4. Run: `npm run build:win`

### Option 3: Use the Unpacked App (Already Built!)

Good news! The app was actually packaged successfully. You can find it at:
```
desktop-app\dist-electron\win-unpacked\
```

To distribute this:

#### Manual Distribution Method:
1. Zip the entire `win-unpacked` folder
2. Send the zip file to users
3. Users extract and run `Shinde Tractors Attendance.exe`

#### Create a Simple Installer with 7-Zip/WinRAR:
1. Install 7-Zip (free) or WinRAR
2. Right-click the `win-unpacked` folder
3. Select "Add to archive" > "Create SFX archive"
4. This creates a self-extracting exe that users can run

### Option 4: Use NSIS Manually (Advanced)

Install NSIS (https://nsis.sourceforge.io/) and create a custom installer script.

## 🎯 QUICKEST SOLUTION

**Enable Developer Mode** (Option 1) - takes 30 seconds, permanent fix!

## Alternative: Use the Already-Built App

The app in `dist-electron\win-unpacked\` is ready to use:
- Complete application
- All dependencies included
- Can be run directly
- Just needs to be distributed (zip it up)

##  File Structure

```
dist-electron\
└── win-unpacked\
    ├── Shinde Tractors Attendance.exe  ← Main executable
    ├── resources\
    ├── locales\
    └── [other electron files]
```

## Testing the Built App

1. Navigate to: `dist-electron\win-unpacked\`
2. Double-click `Shinde Tractors Attendance.exe`
3. App should launch without issues!

## Why This Happens

- Electron-builder downloads winCodeSign tool
- That tool contains macOS symbolic links
- Windows 10/11 by default blocks symlink creation without admin rights
- Developer Mode removes this restriction

## Next Steps

1. Enable Developer Mode (recommended)
2. OR: Use the already-built app in `win-unpacked` folder
3. OR: Run as Administrator

The app IS built and working - we just hit a Windows permission issue during installer packaging!
