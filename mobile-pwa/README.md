# Mobile PWA - Shinde Tractors Attendance

Progressive Web App for marking daily attendance on mobile devices.

## Features

- ✅ Touch-friendly attendance marking interface
- ✅ Bulk actions (Mark all present, Mark department present)
- ✅ Reason capture for absences with paid/unpaid leave option
- ✅ Working days management with calendar interface
- ✅ Employee list view with search and filter
- ✅ Offline support with automatic sync
- ✅ Installable as native app on mobile devices

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access at: http://localhost:5173

4. **Build for Production**
   ```bash
   npm run build
   ```
   Deploy the `dist/` folder to your hosting service (Netlify, Vercel, etc.)

## Installing as PWA

### Android/iOS
1. Open the app in Chrome/Safari
2. Tap the menu (⋮ or share button)
3. Select "Add to Home Screen" or "Install App"
4. App icon will appear on home screen

### Desktop
1. Open in Chrome/Edge
2. Click the install icon in address bar
3. Follow installation prompts

## Offline Support

The app works offline and automatically syncs when connection is restored:
- Attendance records cached locally
- Sync happens automatically in background
- Visual indicators for sync status

## Usage

### Daily Attendance
1. Select date (defaults to today)
2. Review employee list by department
3. Toggle Present/Absent for each employee
4. For absences: Enter reason and mark if paid leave
5. Use bulk actions for faster marking
6. Save attendance

### Working Days
1. Select month and department
2. Tap dates to toggle working days
3. Use quick actions (All days, Weekdays, Clear all)
4. Save working days configuration

## Technology

- **React 18** - UI framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Supabase** - Backend & Database
- **Zustand** - State management
- **date-fns** - Date utilities
- **Lucide React** - Icons
