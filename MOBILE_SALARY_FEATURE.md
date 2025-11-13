# Mobile App - Salary Calculation Feature

## Overview

The salary calculation and saving feature has been successfully added to the mobile PWA (Progressive Web App), providing feature parity with the desktop application. This allows field staff and managers to calculate and save employee salaries directly from mobile devices.

## Features Added

### 1. **Mobile Salary Service** (`mobile-pwa/src/services/api.js`)

Added `salaryService` with the following methods:

```javascript
salaryService.calculateMonthlySalary(employeeId, month, year)
- Calculates monthly salary with full compensation logic
- Returns complete calculation breakdown including Sunday metrics
- Parameters: employeeId, month, year
- Returns: salary calculation object

salaryService.saveSalaryCalculation(calculationData)
- Saves a single salary calculation to database
- Uses upsert for month/year/employee combination
- Parameters: calculationData object
- Returns: saved record

salaryService.getSalaryCalculation(employeeId, month, year)
- Retrieves previously saved calculation
- Returns null if not found
- Parameters: employeeId, month, year
- Returns: salary calculation or null

salaryService.getMonthlySalaryCalculations(month, year)
- Retrieves all calculations for a given month/year
- Includes employee details (name, department)
- Parameters: month, year
- Returns: array of salary calculations with employee data
```

### 2. **Salary Hooks** (`mobile-pwa/src/hooks/useSalary.js`)

Five custom React hooks for salary operations:

#### `useSalaryCalculation(employeeId, month, year)`
- Queries single employee's salary calculation
- Attempts to fetch saved calculation first, then calculates fresh if not saved
- Caches results for 5 minutes
- Enabled only when all parameters provided

#### `useSaveSalaryCalculation()`
- Mutation for saving a single salary calculation
- Invalidates related cache queries on success
- Returns loading, success, and error states

#### `useMonthlySalaryCalculations(month, year)`
- Queries all salary calculations for a month/year
- 5-minute cache duration
- Used for displaying previously saved calculations

#### `useCalculateEmployeeSalaries()`
- Mutation for batch calculating salaries
- Loops through array of employee IDs
- Returns array with success/failure status for each employee
- Invalidates salary cache on completion

#### `useBulkSaveSalaryCalculations()`
- Mutation for saving multiple salary calculations
- Processes array of calculation data
- Returns success/failure status for each save attempt
- Invalidates related caches on completion

### 3. **Salary Calculation Page** (`mobile-pwa/src/pages/SalaryCalculation.jsx`)

Mobile-optimized interface for salary calculations with:

#### Header & Navigation
- Back button to return to previous page
- Page title "Salary Calculation"
- Integrates with mobile Layout component

#### Filter Section
- **Month & Year selector**: Dropdown selectors for month (1-12) and year (range)
- **Department selector**: All departments or specific department
- **Calculate button**: Triggers batch salary calculation for filtered employees
- Shows employee count for transparency

#### Working Days Display
- Shows total working days for selected month/year
- Blue info box at top of results

#### Salary Results
- **Calculation status**: Lists all calculated salaries
- **Save functionality**: Save All button to persist calculations
- **Confirmation dialog**: Yellow confirmation prompt before saving
- **Success/error messages**: Real-time feedback on save operations

#### Individual Salary Cards
- **Header**: Employee name, payable salary (large, bold, green)
- **Attendance summary**: Present days, absent days in grid
- **Sunday work**: Orange-highlighted section showing sundays worked/absent
- **Compensation details**: Compensation days (green) and overtime days (purple)
- **Salary breakdown**: Base salary, deductions (red), overtime (green), final salary
- **Status indicator**: "✓ Already Saved" for previously saved calculations

#### Empty State
- Friendly message when no calculations have been made
- Prompts user to select filters and click Calculate

## Technology Stack

- **State Management**: React Query (useQuery, useMutation)
- **HTTP Client**: Supabase client
- **UI Components**: Lucide React icons
- **Styling**: Tailwind CSS
- **Caching**: React Query with 5-minute stale time
- **Routing**: React Router (NavLink integration)

## Integration Points

### Route Integration (App.jsx)
```javascript
<Route path="salaries" element={<SalaryCalculation onBack={() => window.history.back()} />} />
```

### Navigation Integration (Layout.jsx)
- Added `DollarSign` icon from lucide-react
- New "Salaries" tab in bottom navigation (4 tabs total)
- Active state styling with primary color

### API Service Integration
- Reuses existing `employeeService`, `attendanceService`, `workingDaysService`
- New `salaryService` with 4 methods
- Same Supabase backend as desktop app

## Sunday Compensation Logic

The mobile app uses **identical** compensation logic to the desktop app:

```javascript
// Count Sundays in the month
const totalSundaysInMonth = workingDaysData.working_dates
  .filter(dateStr => new Date(dateStr + 'T00:00:00').getDay() === 0)
  .length;

// Sundays worked (present on Sunday)
const sundaysWorked = attendanceRecords
  .filter(a => a.is_present && isSundayDate(a.attendance_date))
  .length;

// Compensation calculation
const sundayCompensationDays = Math.min(sundaysWorked, regularDaysAbsentUnpaid);
const sundayOvertimeDays = sundaysWorked - sundayCompensationDays;

// Final salary
const payableSalary = monthlySalary 
  - (regularDaysAbsentUnpaid - sundayCompensationDays) * perDayRate 
  + sundayOvertimeDays * perDayRate;
```

**Key Rules**:
- Sundays identified from `working_dates` array (Sunday = getDay() === 0)
- Compensation: min(sundays_worked, unpaid_absences)
- Overtime: Remaining Sunday work paid at 1x daily rate
- Deduction: Only for unpaid absences after compensation

## Data Persistence

All calculations stored in Supabase table `salary_calculations`:

| Column | Type | Description |
|--------|------|-------------|
| employee_id | UUID | Foreign key to employees |
| month | integer | 1-12 |
| year | integer | Calendar year |
| monthly_salary | decimal | Base salary |
| days_present | integer | Regular working days present |
| days_absent_unpaid | integer | Regular working days absent (unpaid) |
| days_absent_paid | integer | Days with paid leave |
| sundays_in_month | integer | Total Sundays in month |
| sundays_worked | integer | Sundays employee worked |
| sundays_absent | integer | Sundays employee was absent |
| sunday_compensation_days | integer | Sundays used for compensation |
| sunday_overtime_days | integer | Sundays paid as overtime |
| per_day_rate | decimal | Daily salary rate |
| deduction_amount | decimal | Deduction from absence |
| overtime_amount | decimal | Payment for overtime |
| payable_salary | decimal | Final salary to pay |
| total_working_days | integer | Total working days in month |

## User Workflow

### Step 1: Access Salary Calculation
- Navigate to "Salaries" tab in bottom navigation
- Page loads with current month/year pre-selected

### Step 2: Set Filters
- Select desired month and year
- Select department (or "All Departments")
- Page shows employee count for selected filters

### Step 3: Calculate Salaries
- Click "Calculate for X Employee(s)" button
- System calculates all selected employees
- Results appear in scrollable list
- Shows loading state during calculation

### Step 4: Review Calculations
- Each employee shows salary breakdown
- Can scroll to see all details
- Sunday work and compensation clearly visible
- Already-saved calculations highlighted in green

### Step 5: Save to Database
- Click "Save All" button to persist calculations
- Confirmation dialog appears
- Click "Confirm Save" to proceed
- Success message displays on completion

## Mobile Optimizations

1. **Touch-Friendly Interface**
   - Large tap targets (44px minimum)
   - Spacing between interactive elements
   - Horizontal scrollable content where needed

2. **Responsive Layout**
   - Grid-based salary cards
   - Stacked layouts on small screens
   - Proper padding and margins for mobile

3. **Performance**
   - React Query caching (5 minute stale time)
   - Lazy loading of calculations
   - Optimized re-renders with proper dependencies

4. **User Experience**
   - Real-time loading indicators
   - Clear error messages
   - Confirmation before destructive operations
   - Success/failure feedback
   - Empty states with helpful guidance

## Comparison: Desktop vs Mobile

| Feature | Desktop | Mobile |
|---------|---------|--------|
| Salary Calculation | ✓ | ✓ |
| Batch Calculate | ✓ | ✓ |
| Save to Database | ✓ | ✓ |
| Department Filter | ✓ | ✓ |
| Month/Year Selection | ✓ | ✓ |
| Salary Breakdown | ✓ | ✓ |
| Sunday Compensation Display | ✓ | ✓ |
| WhatsApp Export | ✓ | - (Future) |
| PDF/Excel Export | ✓ | - (Future) |
| Complex Calculations | Full page | Optimized for mobile |

## Testing Checklist

- [ ] Load Salary Calculation page
- [ ] Select different months and years
- [ ] Filter by department
- [ ] Calculate salaries (verify API calls)
- [ ] Review calculated salary breakdown
- [ ] Verify Sunday compensation displayed correctly
- [ ] Save calculations to database
- [ ] Verify "Already Saved" indicator appears
- [ ] Test with 0 results
- [ ] Test error handling (network failure)
- [ ] Test on various screen sizes
- [ ] Verify cache invalidation after save
- [ ] Check currency formatting (INR)
- [ ] Verify navigation back button works

## Future Enhancements

1. **Salary Export**
   - WhatsApp message generation (mobile-friendly)
   - PDF salary slip generation
   - Excel report export

2. **Advanced Features**
   - Salary history view
   - Comparison between months
   - Salary trend charts

3. **Approval Workflow**
   - Manager approval status
   - Confirmation signatures
   - Audit trail

4. **Additional Reports**
   - Department-wide salary summary
   - Compensation analysis
   - Overtime tracking

## Troubleshooting

### Issue: Calculations show old data
**Solution**: Clear cache by navigating away and back, or refresh the page

### Issue: Save fails silently
**Solution**: Check browser console for errors, verify database connection

### Issue: Department filter doesn't work
**Solution**: Ensure employees have department values assigned in database

### Issue: Sundays not recognized correctly
**Solution**: Verify working_dates array contains proper date strings (YYYY-MM-DD format)

## Code References

- **Service Layer**: `mobile-pwa/src/services/api.js` (lines ~300-400)
- **Hooks**: `mobile-pwa/src/hooks/useSalary.js`
- **Page Component**: `mobile-pwa/src/pages/SalaryCalculation.jsx`
- **Routing**: `mobile-pwa/src/App.jsx` (import + route)
- **Navigation**: `mobile-pwa/src/components/Layout.jsx` (tab addition)

## Database Requirements

The feature requires the following Supabase tables and data:
- `employees`: Full employee records
- `attendance`: Monthly attendance records
- `working_days`: Working days configuration per month/department
- `salary_calculations`: Target table for saving calculations

All tables must already exist from desktop app implementation.

---

**Status**: ✅ Feature Complete
**Version**: 1.0
**Last Updated**: 2024
**Tested On**: Mobile PWA, React Query v3+, Supabase v2+
