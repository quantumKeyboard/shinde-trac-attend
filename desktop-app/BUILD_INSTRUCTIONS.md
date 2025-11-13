# Build Instructions for Shinde Tractors Desktop App

## Prerequisites

1. **Node.js** (v18 or higher) installed
2. **npm** (comes with Node.js)
3. All dependencies installed: `npm install`

## Icon Setup (One-time setup)

Before building, you need to create an icon file:

### Option 1: Use an existing icon
1. Place your `icon.ico` file in the `build/` directory
2. The icon should be 256x256 pixels or larger
3. Must be in `.ico` format for Windows

### Option 2: Create a simple icon
1. Use an online tool like https://icoconvert.com/ or https://convertio.co/png-ico/
2. Create or upload a logo image (PNG/JPG)
3. Convert it to `.ico` format (256x256 recommended)
4. Save as `build/icon.ico`

### Option 3: Use a placeholder
If you don't have an icon, you can temporarily remove the icon references from `package.json`:
- Remove the `"icon"` lines from the `"win"` and `"nsis"` sections

## Building the Installer

### Step 1: Build the React App
```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### Step 2: Build the Windows Installer
```bash
npm run build:win
```

This will:
1. Package the Electron app
2. Create an NSIS installer
3. Output the installer to `dist-electron/` directory

### Step 3: Find Your Installer
Look for the installer file in:
```
desktop-app/dist-electron/
```

The installer will be named something like:
```
Shinde Tractors Attendance Setup 1.0.0.exe
```

## Installation

1. Double-click the `.exe` installer
2. Choose installation directory (or use default)
3. The installer will:
   - Create desktop shortcut
   - Create Start Menu entry
   - Install the application

## Configuration

After installation, before running the app:

1. The app needs Supabase credentials
2. Either:
   - Copy the `.env` file to the installation directory, OR
   - Set environment variables system-wide

## Troubleshooting

### DevTools Opening on Launch
- This has been fixed in the latest version
- DevTools only open in development mode now

### Build Errors
If you get build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try building again

### Icon Missing Error
If the build fails due to missing icon:
- Either create the icon file (see above)
- Or temporarily remove icon references from package.json

### App Won't Connect to Database
- Ensure `.env` file is in the app's installation directory
- Or set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as system environment variables

## Distribution

The generated `.exe` file is a complete installer that can be:
- Shared with other users
- Installed on multiple computers
- Distributed via USB drive, email, or network share

## Updates

To create an updated version:
1. Update the `version` in `package.json`
2. Make your code changes
3. Run `npm run build:win` again
4. Distribute the new installer

## File Structure After Build

```
dist-electron/
├── Shinde Tractors Attendance Setup 1.0.0.exe  (Installer)
├── win-unpacked/                                (Unpacked app files)
└── builder-debug.yml                            (Build logs)
```

## Need Help?

- Check the Electron Builder docs: https://www.electron.build/
- Check the Electron docs: https://www.electronjs.org/docs/latest/
