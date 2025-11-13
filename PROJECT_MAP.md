# 🗺️ Shinde Tractors Attendance System - Complete Project Map

> **For AI Assistants & Developers**: This document provides a comprehensive overview of the entire application architecture, data flow, and component structure.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Application Structure](#application-structure)
5. [Data Flow](#data-flow)
6. [Key Features & Workflows](#key-features--workflows)
7. [Technology Stack](#technology-stack)
8. [File Organization](#file-organization)
9. [Component Hierarchy](#component-hierarchy)
10. [State Management](#state-management)
11. [API Services](#api-services)
12. [Common Patterns](#common-patterns)
13. [Security & Authentication](#security--authentication)
14. [Export & Sharing](#export--sharing)

---

## 📊 System Overview

### Purpose
Employee attendance tracking and salary management system for Shinde Tractors with:
- **Mobile PWA**: Touch-optimized attendance marking (daily use)
- **Desktop App**: Comprehensive management, reporting, and analytics

### User Roles
- **Owner/Manager**: Full access to all features (authenticated users)
- **System**: Auto-generated employee IDs, salary calculations, audit logs

### Core Entities
```
Employees → Attendance Records → Salary Calculations
              ↓
        Working Days (per department/month)
```

---

## 🏗️ Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                   │
├──────────────────────┬──────────────────────────────────┤
│   Mobile PWA         │      Desktop Electron App        │
│   (Attendance Only)  │   (Full Management & Reports)    │
│                      │                                  │
│   - React           │   - React                        │
│   - Vite            │   - Vite                         │
│   - React Router    │   - React Router                 │
│   - Zustand         │   - Zustand                      │
│   - TailwindCSS     │   - TailwindCSS                  │
│   - PWA Support     │   - Electron (Windows)           │
└──────────────────────┴──────────────────────────────────┘
                         ↓
              ┌──────────────────────┐
              │   Supabase Client    │
              │   (@supabase/supabase-js) │
              └──────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend)                    │
├─────────────────────────────────────────────────────────┤
│  - PostgreSQL Database                                  │
│  - Authentication (Auth)                                │
│  - Row Level Security (RLS)                             │
│  - Real-time subscriptions (optional)                   │
│  - REST API (auto-generated)                            │
└─────────────────────────────────────────────────────────┘
```

### Application Types

#### 1. Mobile PWA (`mobile-pwa/`)
- **Purpose**: Daily attendance marking on tablets/phones
- **Primary Users**: Owner/Manager (on-the-go)
- **Key Features**:
  - Mark attendance (Present/Absent)
  - Bulk operations
  - Department filtering
  - Sunday work tracking
  - Offline support (via PWA)
  - Installable to home screen

#### 2. Desktop App (`desktop-app/`)
- **Purpose**: Complete management, analytics, and reporting
- **Primary Users**: Owner/Manager (office/desktop)
- **Key Features**:
  - Dashboard with statistics
  - Employee CRUD operations
  - Attendance viewing/editing
  - Working days configuration
  - Salary calculations
  - Reports & exports (Excel, WhatsApp, PNG cards)
  - Settings & audit logs

---

## 💾 Database Schema

### Tables Overview

```
┌─────────────────────────────────────────────────────────┐
│                     DATABASE TABLES                      │
└─────────────────────────────────────────────────────────┘

1. employees                 6. system_settings
   ├── id (UUID, PK)           ├── id (UUID, PK)
   ├── employee_id (EMP001)    ├── setting_key (unique)
   ├── full_name               ├── setting_value
   ├── department              └── description
   ├── monthly_salary
   ├── contact_number       7. audit_logs
   ├── date_of_joining         ├── id (UUID, PK)
   ├── status (Active/Inactive)├── user_id (FK)
   └── timestamps              ├── action
                               ├── table_name
2. attendance                  ├── record_id
   ├── id (UUID, PK)           ├── old_values (JSONB)
   ├── employee_id (FK)        ├── new_values (JSONB)
   ├── attendance_date         └── created_at
   ├── is_present
   ├── is_paid_leave
   ├── is_sunday_work
   ├── absence_reason
   └── timestamps

3. working_days
   ├── id (UUID, PK)
   ├── month
   ├── year
   ├── department
   ├── total_working_days
   ├── working_dates (array)
   └── timestamps

4. salary_calculations
   ├── id (UUID, PK)
   ├── employee_id (FK)
   ├── month, year
   ├── monthly_salary
   ├── total_working_days
   ├── days_present
   ├── days_absent_unpaid
   ├── days_absent_paid
   ├── sundays_in_month
   ├── sundays_worked
   ├── sundays_absent
   ├── sunday_compensation_days
   ├── sunday_overtime_days
   ├── per_day_rate
   ├── deduction_amount
   ├── overtime_amount
   ├── payable_salary
   ├── is_finalized
   └── timestamps

5. Views (Read-only)
   ├── v_employee_attendance_summary
   └── v_monthly_attendance_stats
```

### Key Relationships

```
employees (1) ──┬── (N) attendance
                │
                ├── (N) salary_calculations
                │
                └── (1) working_days (via department)

working_days (department-based)
```

### Important Database Features

1. **Auto-generated Employee IDs**: Trigger `generate_employee_id()` creates EMP001, EMP002, etc.
2. **Timestamps**: Auto-updated via `update_updated_at_column()` trigger
3. **Validation**: `validate_attendance_date()` prevents future date entries
4. **RLS Policies**: All tables have Row Level Security enabled for authenticated users
5. **Unique Constraints**: 
   - Employee ID (unique)
   - Attendance: (employee_id, attendance_date)
   - Working Days: (month, year, department)
   - Salary Calculations: (employee_id, month, year)

---

## 📁 Application Structure

### Directory Layout

```
ShindeTractors Employee Attendance/
│
├── 📂 database/
│   ├── schema.sql                    # Complete database schema
│   ├── migration_*.sql               # Feature migrations
│   └── fix_database_schema.sql       # Schema fixes
│
├── 📂 mobile-pwa/                    # Mobile Progressive Web App
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Layout.jsx           # Mobile navigation layout
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── 📂 pages/
│   │   │   ├── Login.jsx            # Authentication
│   │   │   ├── AttendanceMark.jsx   # Main attendance marking
│   │   │   ├── EmployeeList.jsx     # Employee directory
│   │   │   ├── EmployeeDetail.jsx   # Individual employee view
│   │   │   ├── WorkingDays.jsx      # Calendar view
│   │   │   └── SalaryCalculation.jsx # Salary view
│   │   ├── 📂 services/
│   │   │   ├── supabase.js          # Supabase client setup
│   │   │   └── api.js               # API service functions
│   │   ├── 📂 store/
│   │   │   └── index.js             # Zustand stores (auth, theme)
│   │   ├── App.jsx                  # Main app component
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── 📂 desktop-app/                   # Desktop Electron Application
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── Layout.jsx           # Sidebar navigation
│   │   │   └── ProtectedRoute.jsx   # Auth guard
│   │   ├── 📂 pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx        # Statistics & overview
│   │   │   ├── Employees.jsx        # Employee management
│   │   │   ├── EmployeeDetail.jsx   # Employee profile & history
│   │   │   ├── Attendance.jsx       # Attendance view/edit
│   │   │   ├── WorkingDays.jsx      # Working days config
│   │   │   ├── SalaryCalculation.jsx # Salary management
│   │   │   ├── Reports.jsx          # Export & reports
│   │   │   └── Settings.jsx         # System settings
│   │   ├── 📂 services/
│   │   │   ├── supabase.js
│   │   │   └── api.js               # Extended API services
│   │   ├── 📂 store/
│   │   │   └── index.js             # Zustand stores
│   │   ├── 📂 utils/
│   │   │   ├── exportExcel.js       # Excel export utilities
│   │   │   └── exportSummary.js     # WhatsApp & image export
│   │   ├── 📂 hooks/
│   │   │   ├── useEmployees.js      # React Query hooks
│   │   │   ├── useAttendance.js
│   │   │   ├── useSalary.js
│   │   │   ├── useWorkingDays.js
│   │   │   └── useDashboard.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── 📂 electron/
│   │   └── main.cjs                 # Electron main process
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── electron-builder.yml         # Build configuration
│
├── 📂 shared/                        # Shared utilities (future use)
│
└── 📄 Documentation files (*.md)
```

---

## 🔄 Data Flow

### 1. Authentication Flow

```
User Login
    ↓
Login.jsx (email/password)
    ↓
supabase.auth.signInWithPassword()
    ↓
Supabase Auth validates
    ↓
Session created & stored in Zustand
    ↓
ProtectedRoute checks auth
    ↓
Redirect to main app
```

### 2. Attendance Marking Flow (Mobile)

```
AttendanceMark.jsx loads
    ↓
1. Load employees: employeeService.getActiveEmployees()
    ↓
2. Load existing attendance: attendanceService.getAttendanceByDate(date)
    ↓
3. Initialize attendance state (merge employees + existing data)
    ↓
User marks Present/Absent for each employee
    ↓
For Absent: Enter reason + check if paid leave
    ↓
For Sunday: Auto-detect & mark is_sunday_work
    ↓
Click "Save Attendance"
    ↓
Validation: No future dates, absence reasons required
    ↓
attendanceService.markBulkAttendance(records)
    ↓
Supabase: UPSERT to attendance table
    ↓
auditService.logAction('MARK_ATTENDANCE')
    ↓
Success toast shown
```

### 3. Salary Calculation Flow

```
SalaryCalculation.jsx
    ↓
User selects: Month, Year, Employee (or "All")
    ↓
Click "Calculate Salary"
    ↓
For each employee:
    ├── salaryService.calculateMonthlySalary(empId, month, year)
    │   ├── Get employee details
    │   ├── Get working days for department
    │   ├── Get attendance records for month
    │   ├── Calculate:
    │   │   ├── Regular days present/absent
    │   │   ├── Sundays worked/absent
    │   │   ├── Sunday compensation (cover absences)
    │   │   ├── Sunday overtime (extra pay)
    │   │   ├── Per-day rate = monthly_salary / days_in_month
    │   │   ├── Deduction = per_day_rate × (absences - compensation)
    │   │   ├── Overtime = per_day_rate × overtime_days
    │   │   └── Payable = monthly_salary - deduction + overtime
    │   └── Return calculation object
    ↓
salaryService.saveSalaryCalculation(data)
    ↓
Display results in table
    ↓
User can export: Excel, WhatsApp, PNG Card
```

### 4. Export & Sharing Flow

```
Reports.jsx or EmployeeDetail.jsx
    ↓
User clicks export button
    ↓
exportSummary.generateWhatsAppMessage() → Text format
exportSummary.generateSalaryCard() → PNG image (html2canvas)
exportExcel.generateMonthlyReport() → Excel file (ExcelJS)
    ↓
Copy to clipboard OR Download file OR Share (Web Share API)
    ↓
User shares via WhatsApp/Email/etc.
```

---

## 🎯 Key Features & Workflows

### 1. Employee Management

**Location**: `desktop-app/src/pages/Employees.jsx`

**Workflow**:
1. View all employees (Active/Inactive filter)
2. Search by name/ID
3. Add new employee (auto-generates ID)
4. Edit employee details
5. Deactivate employee (soft delete)

**Key Functions**:
- `employeeService.getAllEmployees()`
- `employeeService.createEmployee(data)`
- `employeeService.updateEmployee(id, data)`
- `employeeService.deactivateEmployee(id)`

### 2. Daily Attendance Marking

**Location**: `mobile-pwa/src/pages/AttendanceMark.jsx`

**Workflow**:
1. Select date (max: today)
2. Load employees by department
3. Mark each employee: Present/Absent
4. For Absent: Enter reason, check if paid leave
5. Bulk actions: Mark all present, Mark dept present
6. **NEW**: Share custom messages via WhatsApp
7. Save (with validation)

**Sunday Logic**:
- If date is Sunday → Auto-set `is_sunday_work = true` for present employees
- Sunday work used to: (a) compensate absences, (b) earn overtime

**Custom Message Feature**:
- Toggle button shows/hides message box
- Text area for multi-line input
- Send button triggers Web Share API or clipboard copy
- No database storage (ephemeral)

**Key Functions**:
- `attendanceService.getAttendanceByDate(date)`
- `attendanceService.markBulkAttendance(records)`
- `handleShareMessage()` - NEW!

### 3. Working Days Configuration

**Location**: Both apps - `WorkingDays.jsx`

**Workflow**:
1. Select month, year, department
2. View calendar with date selection
3. Mark/unmark working days
4. Total count auto-calculated
5. Save configuration (per department)

**Key Points**:
- Each department has separate working days
- Stores both count and array of dates
- Used in salary calculations

**Key Functions**:
- `workingDaysService.getWorkingDays(month, year, dept)`
- `workingDaysService.setWorkingDays(data)`

### 4. Salary Calculation

**Location**: `desktop-app/src/pages/SalaryCalculation.jsx`

**Formula** (with Sunday compensation):
```
Per-day rate = Monthly Salary ÷ Days in Month

Sunday Compensation Days = MIN(Sundays Worked, Unpaid Absences)
Sunday Overtime Days = Sundays Worked - Sunday Compensation Days

Actual Unpaid Absences = Original Unpaid Absences - Sunday Compensation Days

Deduction = Per-day Rate × Actual Unpaid Absences
Overtime Pay = Per-day Rate × Sunday Overtime Days

Payable Salary = Monthly Salary - Deduction + Overtime Pay
```

**Key Functions**:
- `salaryService.calculateMonthlySalary(empId, month, year)`
- `salaryService.saveSalaryCalculation(data)`
- `salaryService.getMonthlySalaryCalculations(month, year)`

### 5. Reports & Exports

**Location**: `desktop-app/src/pages/Reports.jsx`

**Export Formats**:

1. **WhatsApp Text Message**:
   - Plain text format
   - Includes all salary details
   - Sunday work breakdown
   - Absent dates with reasons
   - Copy to clipboard

2. **Salary Card (PNG)**:
   - Professional image
   - HTML → Canvas (html2canvas)
   - Downloadable
   - Shareable on social media

3. **Excel Reports**:
   - Monthly attendance
   - Salary calculations
   - Multiple sheets
   - Formatted tables

**Key Functions**:
- `exportSummary.generateWhatsAppMessage()`
- `exportSummary.generateSalaryCard()`
- `exportExcel.generateMonthlyReport()`

---

## 🛠️ Technology Stack

### Frontend (Both Apps)

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18.2.0 |
| **Vite** | Build tool | 5.0.8 |
| **React Router** | Routing | 6.20.0 |
| **Zustand** | State management | 4.4.7 |
| **TailwindCSS** | Styling | 3.3.6 |
| **Lucide React** | Icons | 0.294.0 |
| **date-fns** | Date utilities | 3.0.0 |
| **React Hot Toast** | Notifications | 2.4.1 |

### Desktop-Specific

| Technology | Purpose |
|------------|---------|
| **Electron** | Desktop wrapper |
| **ExcelJS** | Excel generation |
| **html2canvas** | Image export |
| **file-saver** | File downloads |
| **Recharts** | Charts (dashboard) |
| **React Query** | Data fetching/caching |

### Mobile-Specific

| Technology | Purpose |
|------------|---------|
| **vite-plugin-pwa** | PWA support |
| **Workbox** | Offline caching |

### Backend

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **PostgreSQL** | Database |
| **Supabase Auth** | Authentication |
| **PostgREST** | Auto-generated API |

---

## 📦 Component Hierarchy

### Mobile PWA

```
App.jsx
├── BrowserRouter
│   ├── Route: /login → Login.jsx
│   └── Route: / → Layout.jsx (Protected)
│       ├── Navigation (Bottom)
│       └── Outlet
│           ├── AttendanceMark.jsx (/)
│           ├── EmployeeList.jsx (/employees)
│           ├── EmployeeDetail.jsx (/employees/:id)
│           ├── WorkingDays.jsx (/working-days)
│           └── SalaryCalculation.jsx (/salaries)
```

### Desktop App

```
App.jsx
├── BrowserRouter
│   ├── Route: /login → Login.jsx
│   └── Route: / → Layout.jsx (Protected)
│       ├── Sidebar Navigation
│       └── Outlet
│           ├── Dashboard.jsx (/)
│           ├── Employees.jsx (/employees)
│           ├── EmployeeDetail.jsx (/employees/:id)
│           ├── Attendance.jsx (/attendance)
│           ├── WorkingDays.jsx (/working-days)
│           ├── SalaryCalculation.jsx (/salary)
│           ├── Reports.jsx (/reports)
│           └── Settings.jsx (/settings)
```

---

## 🔐 State Management

### Zustand Stores

**Location**: `src/store/index.js` (both apps)

#### 1. Auth Store
```javascript
useAuthStore:
  - user: Current user object
  - session: Supabase session
  - setUser(user): Set current user
  - setSession(session): Set session
  - clearAuth(): Logout cleanup
```

#### 2. Theme Store (optional)
```javascript
useThemeStore:
  - theme: 'light' | 'dark'
  - toggleTheme()
  - setTheme(theme)
```

### React Query (Desktop Only)

**Location**: `src/hooks/` (custom hooks)

- `useActiveEmployees()`: Cached employee list
- `useAttendanceByDate(date)`: Cached attendance
- `useSalaryCalculations(month, year)`: Cached salaries
- Auto-refetch on window focus
- Stale time: 5 minutes

---

## 🔌 API Services

### Location: `src/services/api.js`

### Service Modules

#### 1. employeeService
```javascript
- getActiveEmployees(): Get all active employees
- getAllEmployees(): Get all employees
- getEmployee(id): Get single employee
- createEmployee(data): Create new employee
- updateEmployee(id, data): Update employee
- deactivateEmployee(id): Soft delete
```

#### 2. attendanceService
```javascript
- getAttendanceByDate(date): Get day's attendance
- markBulkAttendance(records[]): Save multiple records
- getEmployeeAttendance(empId, start, end): Get range
- updateAttendance(id, data): Update record
```

#### 3. workingDaysService
```javascript
- getWorkingDays(month, year, dept): Get config
- getAllWorkingDaysForMonth(month, year): All depts
- setWorkingDays(data): Save/update config
```

#### 4. salaryService
```javascript
- calculateMonthlySalary(empId, month, year): Compute salary
- saveSalaryCalculation(data): Save to database
- getSalaryCalculation(empId, month, year): Retrieve saved
- getMonthlySalaryCalculations(month, year): All employees
```

#### 5. auditService
```javascript
- logAction(action, table, recordId, old, new): Log audit trail
- getAuditLogs(filters): Retrieve logs
```

#### 6. settingsService (Desktop only)
```javascript
- getSetting(key): Get setting value
- updateSetting(key, value): Update setting
```

---

## 🎨 Common Patterns

### 1. Loading States
```javascript
const [loading, setLoading] = useState(false);

// Usage
if (loading) return <LoadingSpinner />;
```

### 2. Error Handling
```javascript
try {
  await someAsyncOperation();
  toast.success('Success message');
} catch (error) {
  toast.error('Error message');
  console.error('Error:', error);
}
```

### 3. Date Handling
```javascript
import { format } from 'date-fns';

// Format: 'yyyy-MM-dd' for database
const dateStr = format(new Date(), 'yyyy-MM-dd');

// Check Sunday
const isSunday = new Date(date).getDay() === 0;
```

### 4. Supabase Queries
```javascript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .order('column', { ascending: true });

if (error) throw error;
return data;
```

### 5. Protected Routes
```javascript
// ProtectedRoute.jsx wraps authenticated pages
<ProtectedRoute>
  <Layout />
</ProtectedRoute>
```

---

## 🔒 Security & Authentication

### Authentication Flow
1. User enters email/password
2. Supabase Auth validates credentials
3. Session token stored in Zustand (persisted to localStorage)
4. All API calls include auth token (handled by Supabase client)
5. RLS policies on database enforce access control

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies: `auth.role() = 'authenticated'`
- Only logged-in users can access data

### Validation
- Client-side: Form validation, date checks
- Database: Triggers prevent invalid data
- API: Supabase validates all operations

---

## 📤 Export & Sharing

### 1. WhatsApp Text Export

**Function**: `exportSummary.generateWhatsAppMessage()`

**Process**:
1. Takes employee, salaryData, attendanceDetails
2. Formats as WhatsApp-friendly text
3. Includes all salary breakdown
4. Copies to clipboard
5. User can paste into WhatsApp

### 2. Salary Card (Image) Export

**Function**: `exportSummary.generateSalaryCard()`

**Process**:
1. Creates HTML card structure
2. Renders off-screen
3. html2canvas converts to image
4. Returns blob
5. Download or share via Web Share API

### 3. Excel Export

**Function**: `exportExcel.generateMonthlyReport()`

**Process**:
1. Uses ExcelJS library
2. Creates workbook with multiple sheets
3. Formats tables, headers, borders
4. Downloads as .xlsx file

### 4. Custom Message Sharing (NEW!)

**Location**: Daily Attendance Page (Mobile & Desktop)

**Process**:
1. User clicks "Share Custom Message" button
2. Text area appears for message input
3. User types custom message (multi-line supported)
4. Clicks "Send Message" button
5. **Mobile**: Opens native share sheet → User selects WhatsApp/other apps
6. **Desktop**: Copies to clipboard → User pastes in WhatsApp Web/etc.
7. Success notification shown

**Use Cases**:
- Daily attendance notifications
- Absence alerts
- Sunday work announcements
- General team messages

**Technical Details**:
- Uses Web Share API (mobile)
- Falls back to Clipboard API (desktop)
- No database storage (privacy)
- Plain text only (security)

---

## 🎯 Key Business Logic

### Sunday Compensation Algorithm

```javascript
// On regular days: Mark present/absent as normal
// On Sundays: Only mark who worked (others implicitly off)

// Salary calculation:
1. Count Sundays worked (from attendance records)
2. Count unpaid absences on regular days
3. Compensation: MIN(Sundays worked, Unpaid absences)
   - Use Sunday work to "cover" unpaid absences (1:1 ratio)
4. Overtime: Remaining Sunday work
   - Pay extra for these days
5. Final deduction = Unpaid absences - Compensation
6. Final pay = Salary - Deduction + Overtime
```

### Per-Day Rate Calculation

```javascript
// Monthly salary / Days in actual month (28-31)
// NOT working days, but calendar days
const daysInMonth = new Date(year, month, 0).getDate();
const perDayRate = monthlySalary / daysInMonth;
```

---

## 📝 Important Notes for AI Assistants

### When Making Changes

1. **Database Changes**: Update `database/schema.sql` or create migration file
2. **API Changes**: Update both `mobile-pwa/src/services/api.js` AND `desktop-app/src/services/api.js`
3. **Shared Logic**: Consider creating shared utilities in `shared/` folder
4. **Types of Changes**:
   - Feature: Add to both apps if relevant
   - Bug fix: Check both apps for same issue
   - UI: Mobile = touch-friendly, Desktop = detailed
5. **Testing Checklist**:
   - Auth works
   - Data saves correctly
   - Exports generate properly
   - Validation prevents bad data
   - Sunday logic calculates correctly

### Common Tasks

#### Add New Page
1. Create `NewPage.jsx` in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Layout.jsx`
4. Create API functions in `services/api.js` if needed

#### Add New Database Table
1. Add table definition to `database/schema.sql`
2. Add RLS policy
3. Create service functions in `api.js`
4. Create React hooks (if desktop)
5. Build UI components

#### Add New Export Format
1. Create export function in `utils/exportSummary.js` or `utils/exportExcel.js`
2. Add button in UI (Reports.jsx or EmployeeDetail.jsx)
3. Handle download/share logic

---

## 🚀 Quick Reference

### Environment Variables
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Development Commands
```bash
# Mobile PWA
cd mobile-pwa
npm run dev          # http://localhost:5173

# Desktop App
cd desktop-app
npm run dev          # Electron window opens
npm run dev:web      # http://localhost:5174

# Build
npm run build
npm run build:win    # Desktop only
```

### Database Access
- Supabase Dashboard: https://app.supabase.com
- Direct SQL editor available
- Table editor for GUI operations

---

## 📚 Additional Documentation

- **README.md**: Project overview
- **SETUP_GUIDE.md**: Detailed setup instructions
- **USER_MANUAL.md**: End-user guide
- **QUICK_START.md**: 30-minute setup
- **PROJECT_STATUS.md**: Implementation status
- **PROJECT_MAP.md**: Complete architecture map (this file)
- **CUSTOM_MESSAGE_FEATURE.md**: Custom message sharing guide (NEW!)

---

**Last Updated**: November 13, 2025  
**Maintained By**: AI Assistant  
**Version**: 1.1.0 (Added Custom Message Feature)

## 🆕 Recent Changes

### Version 1.1.0 (November 13, 2025)
- ✅ Added custom message sharing feature
- ✅ Integrated Web Share API for mobile
- ✅ Clipboard fallback for desktop
- ✅ Available on Daily Attendance page
- ✅ Complete documentation created

---

*This project map is designed to give any AI assistant or developer a complete understanding of the Shinde Tractors Attendance System without needing to explore the codebase manually.*
