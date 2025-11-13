# Web Deployment Guide for Desktop App

This guide explains how to run and deploy the desktop-app as a web application instead of an Electron desktop application.

## 🌐 Running as Web App (Development)

Instead of running the Electron app, use the new web-only development script:

```powershell
npm run dev:web
```

This will start only the Vite dev server on `http://localhost:5174` without launching Electron.

## 📦 Building for Web Deployment

To build the application for web deployment:

```powershell
npm run build:web
```

or simply:

```powershell
npm run build
```

This will create a `dist/` folder with all the static files ready for deployment.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. Install Vercel CLI (if not already installed):
   ```powershell
   npm install -g vercel
   ```

2. Deploy:
   ```powershell
   cd desktop-app
   vercel
   ```

3. Follow the prompts to link/create your project

4. For production deployment:
   ```powershell
   vercel --prod
   ```

### Option 2: Netlify

1. Install Netlify CLI:
   ```powershell
   npm install -g netlify-cli
   ```

2. Build and deploy:
   ```powershell
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Static File Hosting

After running `npm run build`, upload the contents of the `dist/` folder to any static hosting service:
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront
- Azure Static Web Apps
- Firebase Hosting

## 🔧 Configuration

### Environment Variables

Make sure you have a `.env` file in the `desktop-app` directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For production deployments, set these environment variables in your hosting platform's dashboard.

### Vercel Configuration (Optional)

Create a `vercel.json` file in the `desktop-app` directory:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Netlify Configuration (Optional)

Create a `netlify.toml` file in the `desktop-app` directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🎯 Testing the Build Locally

To test your production build locally:

```powershell
npm run preview
```

This will serve your built application at `http://localhost:4173`

## 🔄 Differences from Electron Version

The web version has the following differences:

1. **File Export**: Excel exports use browser download instead of Electron's file dialog
2. **No Native OS Integration**: No native desktop features like system tray, notifications, etc.
3. **Browser Security**: Subject to browser CORS and security policies

All core functionality (attendance, salary, reports) works identically in both versions.

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Run Electron desktop app (dev mode) |
| `npm run dev:web` | Run web app only (dev mode) |
| `npm run build` | Build for web deployment |
| `npm run preview` | Preview production build locally |
| `npm run build:win` | Build Windows desktop installer |

## ✅ Checklist Before Deployment

- [ ] Environment variables are configured
- [ ] Test with `npm run dev:web` locally
- [ ] Run `npm run build` successfully
- [ ] Test build with `npm run preview`
- [ ] Verify Supabase connection works
- [ ] Test all features (attendance, salary, reports, exports)
- [ ] Configure rewrites/redirects for SPA routing

## 🆘 Troubleshooting

### Blank Page After Deployment
- Check browser console for errors
- Verify environment variables are set on hosting platform
- Ensure `base: './'` is set in `vite.config.js` (already configured)

### Routing Issues (404 on refresh)
- Add SPA rewrites configuration (see above)
- All routes should redirect to `/index.html`

### Supabase Connection Issues
- Verify environment variables are correctly set
- Check Supabase dashboard for allowed origins
- Add your deployment URL to Supabase's allowed origins

