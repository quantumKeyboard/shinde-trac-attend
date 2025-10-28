# Desktop Application - Shinde Tractors Attendance

Electron-based desktop application for comprehensive attendance management, reporting, and analytics.

## Features

- ✅ **Dashboard**: Real-time statistics and overview
- ✅ **Employee Management**: Add, edit, and manage employee profiles
- ✅ **Attendance Viewing**: View and analyze attendance records
- ✅ **Working Days**: Configure department-specific working days
- ✅ **Salary Calculation**: Automated salary processing with deductions
- ✅ **Reports & Export**: Excel reports, WhatsApp messages, salary cards
- ✅ **Settings**: System configuration and security settings
- ✅ **Offline Operation**: Works without internet connection

## Setup

### Prerequisites

- Node.js 18+ and npm
- Windows OS
- Supabase project (same as mobile PWA)

### Installation

1. **Install Dependencies**
   ```bash
   cd desktop-app
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in `desktop-app/` directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Mode**
   ```bash
   npm run dev
   ```
   
   This will:
   - Start the Vite dev server on port 5174
   - Launch the Electron window
   - Enable hot module replacement

4. **Build for Production**
   ```bash
   npm run build:win
   ```
   
   The installer will be created in `desktop-app/dist-electron/`

### Building the Installer

The production build creates a Windows NSIS installer that:
- Installs the application to Program Files
- Creates desktop and start menu shortcuts
- Can be installed/uninstalled like any Windows application

## Key Features

### 1. Dashboard
- Real-time employee and attendance statistics
- Top absentees panel sorted by absence count
- Quick action buttons for common tasks
- Monthly overview

### 2. Employee Management
- Add new employees with auto-generated IDs
- Edit employee details (name, department, salary, contact)
- Deactivate employees who leave
- Search and filter by department/status
- View complete employee history

### 3. Attendance Management
- View attendance by date, employee, or department
- Edit past attendance records (with validation)
- Monthly calendar view with color coding
- Absence reason tracking
- Paid vs unpaid leave distinction

### 4. Working Days Configuration
- Set working days per department per month
- Calendar interface for easy selection
- Quick actions (all days, weekdays, clear)
- Historical tracking of working day changes

### 5. Salary Calculation
- Automatic calculation based on:
  - Monthly salary
  - Working days
  - Attendance (present/absent)
  - Paid vs unpaid leaves
- Formula display for transparency:
  ```
  Per Day Rate = Monthly Salary ÷ Working Days
  Deduction = Per Day Rate × Unpaid Absent Days
  Payable Salary = Monthly Salary - Deduction
  ```
- Bulk processing for all employees
- Review and finalize before distribution

### 6. Monthly Summary Generation

#### WhatsApp Message Format
Generates copy-paste ready text messages with:
- Employee details
- Attendance summary
- Absent dates with reasons
- Salary calculation breakdown
- Professional formatting

#### Salary Card Images
Creates professional PNG cards with:
- Company branding
- Employee information
- Attendance statistics
- Salary breakdown
- Downloadable for WhatsApp sharing

#### Bulk Export
- Generate summaries for all employees at once
- Export to organized folder structure
- Batch download cards

### 7. Reports & Export

#### Excel Reports
- **Monthly Attendance Report**: Complete attendance data
- **Salary Report**: Calculations with formulas
- **Employee Report**: Individual history
- **Department Report**: Dept-wise analysis
- **Year-end Report**: Annual summary

All Excel files include:
- Professional formatting
- Formulas for calculations
- Color coding
- Summary statistics
- Company branding

### 8. Backup & Data Management
- Automatic weekly backups to local storage
- Manual backup on-demand
- Export data to Excel for external backup
- Organized file structure

### 9. Security Features
- Secure authentication
- Session management with auto-logout
- Action audit logging (who did what, when)
- Role-based access control
- Data validation and integrity checks

### 10. Data Validation

Built-in safeguards:
- ❌ Cannot mark attendance for future dates
- ⚠️ Warning when editing attendance older than 3 days
- ✅ Confirmation required for bulk operations
- ✅ Validation: Working days must be set before salary calculation
- ✅ Absence reason mandatory for unpaid leaves
- ✅ Salary calculations double-verified

## Usage Guidelines

### Daily Workflow
1. **Morning**: Check dashboard for overview
2. **Throughout Day**: Monitor attendance via mobile PWA
3. **End of Day**: Review attendance summary

### Monthly Workflow
1. **Start of Month**: Configure working days for all departments
2. **During Month**: Monitor absentee panel on dashboard
3. **Month End**:
   - Review attendance completeness
   - Calculate salaries for all employees
   - Generate summaries (WhatsApp + cards)
   - Export reports to Excel
   - Distribute salary information to employees

### Best Practices
- Set working days at the start of each month
- Mark attendance daily via mobile PWA
- Review top absentees weekly
- Generate monthly reports for record keeping
- Backup data regularly

## Keyboard Shortcuts

- `Ctrl + 1-7`: Navigate to pages
- `Ctrl + N`: Add new employee
- `Ctrl + E`: Export current view
- `Ctrl + F`: Focus search
- `Ctrl + Q`: Logout

## Troubleshooting

### Application won't start
- Ensure Node.js 18+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 5174 is already in use

### Database connection issues
- Verify `.env` file has correct Supabase credentials
- Check internet connection
- Confirm Supabase project is active

### Export not working
- Ensure you have write permissions in the export directory
- Check available disk space
- Try manual export to different location

## Technology Stack

- **Frontend**: React 18, Vite
- **Desktop Framework**: Electron
- **UI**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Excel Export**: ExcelJS
- **Image Generation**: html2canvas
- **Icons**: Lucide React

## File Structure

```
desktop-app/
├── src/
│   ├── components/      # Reusable React components
│   ├── pages/          # Page components
│   ├── services/       # API and Supabase services
│   ├── store/          # State management (Zustand)
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── electron/
│   └── main.cjs        # Electron main process
├── public/             # Static assets
└── package.json        # Dependencies and scripts
```

## Support

For technical support or issues:
1. Check this documentation
2. Review error logs in the application
3. Contact system administrator

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025
