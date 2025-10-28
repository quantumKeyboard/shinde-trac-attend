# Shinde Tractors - Employee Attendance & Salary Management System
## Complete Setup Guide

This guide will walk you through setting up the complete system from scratch.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Mobile PWA Setup](#mobile-pwa-setup)
4. [Desktop App Setup](#desktop-app-setup)
5. [First Time Configuration](#first-time-configuration)
6. [User Accounts](#user-accounts)
7. [Testing the System](#testing-the-system)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- **Computer Requirements**:
  - Windows 10 or later
  - At least 4GB RAM
  - 2GB free disk space
  - Internet connection

- **Software to Install**:
  - [Node.js 18 or later](https://nodejs.org/) (includes npm)
  - Git (optional, for version control)
  - Modern web browser (Chrome, Edge, or Firefox)

- **Accounts Needed**:
  - [Supabase Account](https://supabase.com) (free tier is sufficient)

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: `shinde-tractors-attendance`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
   - **Plan**: Free tier is fine for starting
4. Click "Create new project"
5. Wait 2-3 minutes for project to be ready

### Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

### Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire content from `database/schema.sql` file
4. Paste into the SQL editor
5. Click "Run" button
6. You should see "Success. No rows returned" message
7. Go to **Table Editor** to verify tables were created:
   - employees
   - attendance
   - working_days
   - salary_calculations
   - audit_logs
   - system_settings

### Step 4: Create User Accounts

1. In Supabase dashboard, go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Create first user (Owner):
   - **Email**: `owner@shindetractors.com` (or your preferred email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: Yes
4. Create second user (Manager):
   - **Email**: `manager@shindetractors.com`
   - **Password**: Create a strong password
   - **Auto Confirm User**: Yes
5. Save these credentials securely!

---

## Mobile PWA Setup

### Step 1: Install Dependencies

1. Open PowerShell or Command Prompt
2. Navigate to project folder:
   ```powershell
   cd "d:\Projects\ShindeTractors Employee Attendance\mobile-pwa"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
   This will take 2-3 minutes

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Edit `.env` file with your text editor
3. Replace with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
   ```
4. Save the file

### Step 3: Run Development Server

1. Start the dev server:
   ```powershell
   npm run dev
   ```
2. You should see:
   ```
   VITE v5.0.8  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```
3. Open browser and go to `http://localhost:5173`
4. You should see the login page

### Step 4: Test the App

1. Login with one of the user accounts you created
2. If successful, you should see the attendance marking interface
3. Keep this running for now

---

## Desktop App Setup

### Step 1: Install Dependencies

1. Open a NEW PowerShell or Command Prompt window
2. Navigate to desktop app folder:
   ```powershell
   cd "d:\Projects\ShindeTractors Employee Attendance\desktop-app"
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```
   This will take 2-3 minutes

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:
   ```powershell
   copy .env.example .env
   ```
2. Edit `.env` file
3. Use the SAME Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...your_key_here
   ```
4. Save the file

### Step 3: Run Development Mode

1. Start the desktop app:
   ```powershell
   npm run dev
   ```
2. Wait for "Electron app started" message
3. The desktop application window will open automatically
4. You should see the login screen

### Step 4: Test the App

1. Login with the same user account
2. You should see the dashboard
3. Explore the interface

---

## First Time Configuration

### Step 1: Add Employees

Using the **Desktop App**:

1. Go to **Employees** page (sidebar)
2. Click "Add Employee" button
3. Fill in employee details:
   - Full Name: `John Doe`
   - Department: `Salesman`
   - Monthly Salary: `25000`
   - Contact Number: `9876543210`
   - Date of Joining: Select date
4. Click "Add Employee"
5. Note the auto-generated Employee ID (e.g., `EMP001`)
6. Repeat for a few more test employees

### Step 2: Configure Working Days

Using **Mobile PWA** or **Desktop App**:

1. Go to **Working Days** page
2. Select current month
3. Select department: `Salesman`
4. Click "Weekdays" quick action (marks Mon-Sat)
5. Or manually select working days
6. Click "Save Working Days"
7. Repeat for other departments if needed

### Step 3: Mark Test Attendance

Using **Mobile PWA**:

1. Go to **Attendance** page (home)
2. Date should default to today
3. You'll see list of active employees
4. Mark some present, some absent
5. For absent employees, enter reason
6. Select "Paid Leave" checkbox if applicable
7. Click "Save Attendance"

---

## User Accounts

You now have two accounts:

### Owner Account
- **Email**: `owner@shindetractors.com`
- **Access**: Full system access
- **Use for**: All operations

### Manager Account
- **Email**: `manager@shindetractors.com`
- **Access**: Full system access
- **Use for**: Daily operations

Both accounts have identical permissions in this setup.

---

## Testing the System

### Test 1: Complete Workflow

1. **Add Employee** (Desktop App):
   - Add 2-3 test employees in different departments

2. **Set Working Days** (Mobile PWA):
   - Configure working days for current month
   - All departments should have working days set

3. **Mark Attendance** (Mobile PWA):
   - Mark attendance for today
   - Include some present and some absent
   - Add absence reasons

4. **View Dashboard** (Desktop App):
   - Check statistics update
   - Verify today's attendance count
   - Check absentees panel

5. **Generate Reports** (Desktop App):
   - Go to Reports page
   - Try exporting monthly attendance

### Test 2: Mobile PWA Installation

On your **mobile phone**:

1. Open Chrome browser
2. Go to the app URL (when deployed) or your computer's IP:
   - Find your PC's IP: `ipconfig` in PowerShell
   - Access: `http://YOUR_IP:5173`
3. Tap menu (⋮) > "Install app" or "Add to Home Screen"
4. Open the installed app
5. Login and test attendance marking

---

## Deployment

### Mobile PWA Deployment

Several options:

#### Option 1: Netlify (Recommended, Free)

1. Create account at [netlify.com](https://netlify.com)
2. Build the PWA:
   ```powershell
   cd mobile-pwa
   npm run build
   ```
3. Drag the `dist` folder to Netlify's deploy area
4. Your app will be live at `https://your-app.netlify.app`
5. Share this URL with mobile users

#### Option 2: Vercel (Also Free)

1. Install Vercel CLI:
   ```powershell
   npm install -g vercel
   ```
2. Deploy:
   ```powershell
   cd mobile-pwa
   vercel
   ```
3. Follow prompts

### Desktop App Deployment

Build Windows installer:

```powershell
cd desktop-app
npm run build:win
```

The installer will be in `desktop-app/dist-electron/`:
- Find file like `Shinde-Tractors-Attendance-Setup-1.0.0.exe`
- Copy this file to a USB drive
- Install on any Windows PC
- No internet needed after installation (except for database sync)

---

## Troubleshooting

### Issue: "npm: command not found"

**Solution**: Node.js not installed properly
- Download and install from [nodejs.org](https://nodejs.org/)
- Restart PowerShell after installation
- Verify: `node --version` should show version number

### Issue: "Port 5173 already in use"

**Solution**: Another app using the port
- Close any previous instances
- Or change port in `vite.config.js`:
  ```js
  server: { port: 5174 }
  ```

### Issue: "Supabase connection failed"

**Solution**: Check credentials
- Verify `.env` file has correct URL and key
- Check for spaces or extra characters
- Ensure Supabase project is active
- Test internet connection

### Issue: "Tables not found"

**Solution**: Database not set up
- Go back to Supabase SQL Editor
- Run `database/schema.sql` again
- Check for any error messages

### Issue: Login fails with "Invalid credentials"

**Solution**: User account issue
- Check email and password are correct
- Verify user was created in Supabase Authentication
- Try "Forgot Password" flow
- Or create a new user account

### Issue: Desktop app won't open

**Solution**: Electron issue
- Delete `node_modules` folder
- Run `npm install` again
- Try `npm run dev` instead of double-clicking

### Issue: "Module not found" errors

**Solution**: Dependencies missing
- Run `npm install` in the respective folder
- Check if `node_modules` folder exists
- Check internet connection during install

---

## Getting Help

If you encounter issues:

1. **Check the logs**:
   - Browser console (F12) for web errors
   - Terminal output for server errors

2. **Common fixes**:
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again
   - Restart the development server
   - Clear browser cache

3. **Database issues**:
   - Go to Supabase Table Editor
   - Manually inspect data
   - Check Row Level Security policies are enabled

---

## Next Steps

Once everything is working:

1. **Production Deployment**:
   - Deploy mobile PWA to hosting service
   - Build and distribute desktop app installer
   - Set up SSL certificate for secure access

2. **Data Entry**:
   - Add all actual employees
   - Configure working days for all departments
   - Start marking daily attendance

3. **Training**:
   - Train users on mobile app for attendance marking
   - Train administrators on desktop app features
   - Create quick reference guides

4. **Backups**:
   - Enable auto-backup in settings
   - Export initial data to Excel
   - Schedule regular backup reviews

---

## Success Checklist

- [ ] Supabase project created and database set up
- [ ] User accounts created and tested
- [ ] Mobile PWA running and accessible
- [ ] Desktop app running
- [ ] Test employees added
- [ ] Working days configured
- [ ] Attendance marked and visible
- [ ] Dashboard showing correct statistics
- [ ] Reports can be generated

**Congratulations!** Your system is now ready for production use! 🎉

---

**Support**: For questions or issues, refer to the individual README files in each folder or contact your system administrator.
