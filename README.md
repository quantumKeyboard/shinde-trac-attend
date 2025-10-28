# Shinde Tractors - Employee Attendance & Salary Management System

A comprehensive attendance tracking and salary calculation system with mobile PWA and desktop applications.

## 🎯 Features

- **Employee Management**: Complete CRUD operations for employee profiles
- **Mobile Attendance**: Touch-friendly PWA for daily attendance marking
- **Working Days Management**: Department-wise working days configuration
- **Desktop Dashboard**: Comprehensive attendance analytics and reporting
- **Salary Calculation**: Automated salary calculations with deductions
- **Monthly Summaries**: WhatsApp text, professional card images, and Excel exports
- **Security**: Secure authentication, audit logs, and data encryption
- **Offline Support**: Mobile app works offline and syncs when online

## 📁 Project Structure

```
├── mobile-pwa/          # Progressive Web App for mobile attendance marking
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # Supabase and business logic
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   └── public/          # Static assets and PWA manifest
│
├── desktop-app/         # Electron desktop application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # Supabase and business logic
│   │   ├── utils/       # Utility functions
│   │   └── App.jsx      # Main app component
│   └── electron/        # Electron main process
│
├── database/            # Supabase database schemas and migrations
└── shared/              # Shared utilities and types
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Windows OS (for desktop app)

### Setup Instructions

1. **Clone and Install Dependencies**
   ```bash
   cd "d:\Projects\ShindeTractors Employee Attendance"
   
   # Install mobile PWA dependencies
   cd mobile-pwa
   npm install
   
   # Install desktop app dependencies
   cd ../desktop-app
   npm install
   ```

2. **Configure Supabase**
   - Create a new Supabase project
   - Run the SQL migrations in `database/schema.sql`
   - Copy your Supabase URL and anon key

3. **Environment Variables**
   
   Create `.env` files in both `mobile-pwa/` and `desktop-app/`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Applications**
   
   **Mobile PWA (Development):**
   ```bash
   cd mobile-pwa
   npm run dev
   ```
   Access at: http://localhost:5173
   
   **Desktop App (Development):**
   ```bash
   cd desktop-app
   npm run dev
   ```

5. **Build for Production**
   
   **Mobile PWA:**
   ```bash
   cd mobile-pwa
   npm run build
   # Deploy the 'dist' folder to your hosting service
   ```
   
   **Desktop App:**
   ```bash
   cd desktop-app
   npm run build:win
   # Installer will be in desktop-app/dist/
   ```

## 👥 User Roles

- **Owner**: Full access to all features
- **Manager**: Full access to all features

## 📱 Mobile PWA Installation

1. Open the PWA URL in mobile browser (Chrome/Edge)
2. Tap the menu icon (⋮)
3. Select "Install app" or "Add to Home Screen"
4. The app icon will appear on your home screen

## 🔐 Security Features

- Secure authentication with Supabase Auth
- Session management with auto-logout
- All actions logged in audit trail
- Data encrypted in transit and at rest
- Role-based access control

## 📊 Reports & Exports

- Monthly attendance reports (Excel)
- Salary calculation reports (Excel)
- Individual employee summaries (Text + PNG card)
- WhatsApp-ready message formats
- Automatic weekly backups

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Desktop**: Electron
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Excel Export**: ExcelJS
- **Image Generation**: html2canvas
- **Icons**: Lucide React

## 📝 License

Proprietary - Shinde Tractors Internal Use Only

## 🆘 Support

For technical support, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
