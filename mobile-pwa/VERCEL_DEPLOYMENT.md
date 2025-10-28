# Vercel Deployment Guide - Shinde Tractors Mobile PWA

This guide will help you deploy the Mobile PWA to Vercel securely, ensuring no sensitive information is exposed.

---

## 🔐 Security First

**IMPORTANT**: Your `.env` file contains sensitive Supabase credentials. This file is automatically excluded from deployment via `.gitignore` and `.vercelignore`.

**Never commit or upload your `.env` file!**

---

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Supabase project set up and running
- ✅ Mobile PWA tested locally (`npm run dev`)
- ✅ Vercel account (free tier is sufficient)
- ✅ Your Supabase URL and anon key ready

---

## 🚀 Deployment Methods

### Method 1: Vercel Dashboard (Recommended for First-Time)

This is the easiest method and doesn't require Git.

#### Step 1: Prepare for Deployment

1. **Test Build Locally First**:
   ```powershell
   cd "D:\Projects\ShindeTractors Employee Attendance\mobile-pwa"
   npm run build
   ```
   - Should complete without errors
   - Creates a `dist` folder
   - Verify no `.env` file in `dist` folder

2. **Verify Security Files Exist**:
   - ✅ `.gitignore` exists (prevents Git commits)
   - ✅ `.vercelignore` exists (prevents Vercel uploads)
   - ✅ `vercel.json` exists (deployment config)

#### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose sign-up method:
   - GitHub (recommended if you have GitHub)
   - GitLab
   - Bitbucket
   - Email
4. Complete sign-up process

#### Step 3: Deploy via Dashboard

**Option A: Direct Upload (No Git Required)**

1. Log into Vercel dashboard
2. Click "Add New..." → "Project"
3. Scroll down to "Import Third-Party Git Repository" or look for manual upload option
4. **STOP! Don't upload the folder directly**
5. Instead, use Vercel CLI (see Method 2)

**Recommended: Use Vercel CLI for better control**

---

### Method 2: Vercel CLI (Recommended)

The CLI gives you better control over what gets deployed.

#### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

Wait for installation to complete.

#### Step 2: Login to Vercel

```powershell
vercel login
```

- Choose your preferred login method
- Follow the prompts to authenticate
- You should see "Success! Authentication complete"

#### Step 3: Deploy the App

1. Navigate to the mobile-pwa folder:
   ```powershell
   cd "D:\Projects\ShindeTractors Employee Attendance\mobile-pwa"
   ```

2. **IMPORTANT: Verify .env is NOT committed**:
   ```powershell
   # This should show .env is ignored
   type .gitignore
   type .vercelignore
   ```

3. **Deploy to Vercel**:
   ```powershell
   vercel
   ```

4. **Answer the Setup Questions**:
   ```
   ? Set up and deploy? [Y/n] → Press Y
   ? Which scope? → Select your account
   ? Link to existing project? [y/N] → Press N (first time)
   ? What's your project's name? → shinde-tractors-attendance (or your choice)
   ? In which directory is your code located? → Press Enter (current directory)
   ? Want to override the settings? [y/N] → Press N
   ```

5. **Wait for Deployment**:
   - Vercel will build your app
   - Upload the build files
   - Deploy to their servers
   - This takes 1-3 minutes

6. **Deployment Complete!**
   ```
   ✅ Production: https://shinde-tractors-attendance-xxx.vercel.app
   ```
   - Copy this URL - this is your production app!

#### Step 4: Configure Environment Variables on Vercel

**CRITICAL STEP**: Your app needs Supabase credentials to work.

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Find your project "shinde-tractors-attendance"
3. Click on the project
4. Go to **Settings** tab
5. Click **Environment Variables** in left sidebar
6. Add your environment variables:

   **Variable 1:**
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase URL (e.g., `https://xxxxx.supabase.co`)
   - **Environment**: Check all (Production, Preview, Development)
   - Click "Save"

   **Variable 2:**
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase anon key (the long string starting with `eyJhbGc...`)
   - **Environment**: Check all (Production, Preview, Development)
   - Click "Save"

7. **Redeploy with Environment Variables**:
   - Go to **Deployments** tab
   - Click the three dots (...) on latest deployment
   - Click **Redeploy**
   - Check "Use existing Build Cache"
   - Click **Redeploy**
   - Wait for redeployment to complete (~1-2 minutes)

#### Step 5: Test Your Deployed App

1. Open the production URL in your browser:
   ```
   https://shinde-tractors-attendance-xxx.vercel.app
   ```

2. **Verify it works**:
   - ✅ Login page loads
   - ✅ Can login with your credentials
   - ✅ Can see attendance page
   - ✅ Data loads from Supabase
   - ✅ Can mark attendance

3. **Test on Mobile**:
   - Open the URL on your phone's browser
   - Should work smoothly
   - Try installing as PWA:
     - Chrome: Menu ⋮ → "Install app"
     - Safari: Share → "Add to Home Screen"

---

### Method 3: Git Integration (Advanced)

If you want automatic deployments on code changes:

#### Step 1: Initialize Git Repository

```powershell
cd "D:\Projects\ShindeTractors Employee Attendance\mobile-pwa"
git init
```

#### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `shinde-tractors-attendance`
4. **Important**: Choose **Private** repository (not public!)
5. Don't initialize with README
6. Click "Create repository"

#### Step 3: Push Code to GitHub

```powershell
# Verify .env is in .gitignore BEFORE committing!
type .gitignore | findstr ".env"

# Should see: .env

# Add all files (except those in .gitignore)
git add .

# Commit
git commit -m "Initial commit - Mobile PWA"

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/shinde-tractors-attendance.git

# Push
git push -u origin main
```

#### Step 4: Connect Vercel to GitHub

1. Go to Vercel dashboard
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your GitHub repository
5. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables (same as Method 2, Step 4)
7. Click "Deploy"

#### Step 5: Automatic Deployments

Now, whenever you push changes to GitHub:
```powershell
git add .
git commit -m "Update feature"
git push
```
Vercel will automatically rebuild and redeploy!

---

## 🔒 Security Checklist

Before deploying, verify:

- [ ] `.env` file is listed in `.gitignore`
- [ ] `.env` file is listed in `.vercelignore`
- [ ] Environment variables are set in Vercel dashboard (not in code)
- [ ] No hardcoded credentials in source code
- [ ] Supabase Row Level Security (RLS) is enabled
- [ ] GitHub repository is **private** (if using Git method)
- [ ] Build completes successfully locally
- [ ] `.env` file is NOT in the `dist` folder after build

**DOUBLE CHECK**: Never commit your `.env` file to Git!

---

## 🌐 Custom Domain (Optional)

Want a custom domain like `attendance.shindetractors.com`?

### Step 1: Add Domain in Vercel

1. Go to project settings
2. Click **Domains** tab
3. Enter your domain name
4. Click "Add"

### Step 2: Configure DNS

Vercel will show you DNS records to add:

**For subdomain (e.g., attendance.shindetractors.com):**
- Type: `CNAME`
- Name: `attendance`
- Value: `cname.vercel-dns.com`

**For root domain (e.g., shindetractors.com):**
- Type: `A`
- Value: Vercel's IP addresses

### Step 3: Wait for DNS Propagation

- Usually takes 5-60 minutes
- Vercel will automatically issue SSL certificate
- Your app will be accessible at your custom domain

---

## 🔄 Updating Your Deployed App

### For CLI Deployments:

```powershell
# Make your code changes
# Test locally with: npm run dev

# Deploy updates
cd "D:\Projects\ShindeTractors Employee Attendance\mobile-pwa"
vercel --prod
```

### For Git Integration:

```powershell
# Make your code changes
git add .
git commit -m "Description of changes"
git push
# Vercel automatically deploys!
```

---

## 📱 Sharing the App

After deployment, share the URL with your team:

### For Mobile Users:

**WhatsApp Message Template:**
```
📱 Shinde Tractors Attendance App is now live!

🔗 Link: https://your-app.vercel.app

📲 To install on your phone:
1. Open the link in Chrome browser
2. Tap menu (⋮) at top right
3. Select "Install app" or "Add to Home Screen"
4. The app icon will appear on your home screen

🔐 Login with your provided credentials

For support, contact: [Your contact info]
```

### For Desktop Users:

They can access the same URL in any web browser:
```
https://your-app.vercel.app
```

Bookmark it for easy access!

---

## 🐛 Troubleshooting

### Issue: "Build Failed" on Vercel

**Solution 1**: Check build locally first
```powershell
npm run build
```
Fix any errors shown.

**Solution 2**: Check Node version
- Vercel uses Node 18+ by default
- Your app requires Node 18+
- Should work fine

### Issue: App Loads but "Connection Error"

**Solution**: Environment variables missing
1. Go to Vercel dashboard → Project → Settings → Environment Variables
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Redeploy the app

### Issue: "Invalid credentials" when trying to login

**Solution**: Supabase authentication issue
- Verify user accounts exist in Supabase dashboard
- Check Supabase credentials in Vercel environment variables
- Ensure Supabase project is active and not paused

### Issue: Environment variables not working

**Solution**: Variable names must start with `VITE_`
- ✅ Correct: `VITE_SUPABASE_URL`
- ❌ Wrong: `SUPABASE_URL`
- After fixing, redeploy

### Issue: "This site can't be reached"

**Solution**: Check deployment status
1. Go to Vercel dashboard
2. Check deployment status (should be "Ready")
3. Wait a few minutes if still deploying
4. Check for any deployment errors in logs

### Issue: Changes not appearing after deployment

**Solution**: Clear cache
- Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or clear browser cache
- For mobile PWA: Uninstall and reinstall the app

---

## 📊 Monitoring Your Deployment

### View Deployment Logs:

1. Vercel dashboard → Your project
2. Click on **Deployments** tab
3. Click on any deployment
4. View **Build Logs** and **Function Logs**

### Analytics:

Vercel provides basic analytics:
- Page views
- Top pages
- Visitor locations
- Performance metrics

Access via: Project → Analytics tab

---

## 💰 Pricing

**Free Tier Includes:**
- Unlimited deployments
- Automatic HTTPS
- 100GB bandwidth/month
- Global CDN
- Perfect for your use case!

**If you need more:**
- Pro plan: $20/month
- Enterprise: Custom pricing
- You likely won't need more than free tier

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] App is accessible at production URL
- [ ] Login works correctly
- [ ] Data loads from Supabase
- [ ] Attendance can be marked
- [ ] Mobile PWA installs properly
- [ ] Desktop users can access via browser
- [ ] Environment variables are secure in Vercel
- [ ] `.env` file is NOT in Git or deployed files
- [ ] URL has been shared with users
- [ ] Tested on multiple devices
- [ ] Custom domain configured (if desired)

---

## 🎉 Success!

Your attendance app is now:
- ✅ Deployed to Vercel
- ✅ Accessible from anywhere
- ✅ Secure (no exposed credentials)
- ✅ Automatic HTTPS
- ✅ Fast global CDN
- ✅ PWA-enabled for mobile
- ✅ Production-ready!

---

## 📞 Need Help?

1. **Check Vercel docs**: [vercel.com/docs](https://vercel.com/docs)
2. **Vercel support**: Available in dashboard
3. **Check deployment logs**: Often shows exact error
4. **Local testing**: Always test with `npm run dev` and `npm run build` first

---

## 🔐 Security Reminder

**NEVER:**
- ❌ Commit `.env` file to Git
- ❌ Share your Supabase anon key publicly
- ❌ Upload `.env` to Vercel (use environment variables)
- ❌ Make GitHub repository public
- ❌ Share admin credentials insecurely

**ALWAYS:**
- ✅ Use Vercel environment variables for secrets
- ✅ Keep `.env` in `.gitignore`
- ✅ Use HTTPS (automatic with Vercel)
- ✅ Enable Supabase Row Level Security
- ✅ Keep GitHub repo private

---

**Deployment Date**: [Add date when you deploy]  
**Production URL**: [Add your Vercel URL here]  
**Deployed By**: [Your name]

---

For technical questions about the app itself, refer to `README.md` and `SETUP_GUIDE.md`.

