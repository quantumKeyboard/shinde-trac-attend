# Cache Invalidation & Data Refresh System

## Overview
The application uses **React Query** for data caching and automatic refresh. When a salary calculation is saved, the system automatically updates data across all pages.

## How It Works

### 1. Salary Calculation Save Trigger
When you save a salary calculation in the **Salary Calculation** page:

```javascript
// Save button clicked
saveSalaryCalculation.mutateAsync(calculationData)
```

### 2. Automatic Cache Invalidation
The `useSaveSalaryCalculation` hook automatically invalidates multiple query caches:

```javascript
// All these queries get invalidated (marked as stale)
- salaryKeys.all              // All salary data
- salaryKeys.single()         // Specific employee salary
- salaryKeys.calculations()   // Monthly calculations
- ['dashboard']               // Dashboard stats
- ['employees']               // Employee lists & details
- ['attendance']              // Attendance records
```

### 3. Automatic Data Refresh
Pages that use invalidated queries will **automatically refetch** their data:

#### Dashboard Page
- ✅ Employee counts update
- ✅ Attendance stats refresh
- ✅ Monthly absentee list updates

#### Employees Page
- ✅ Employee list refreshes
- ✅ Latest data shown for all employees

#### Employee Detail Page
- ✅ Salary calculations update
- ✅ Attendance records refresh
- ✅ Working days data updates
- ✅ Per-day salary recalculates

#### Salary Calculation Page
- ✅ Shows "Saved" badge
- ✅ Previously calculated data refreshes

## User Experience

### What You'll See:
1. **Click "Save"** on a salary calculation
2. Button shows **"Saving..."** with spinner
3. Success toast notification appears
4. **"Saved"** badge appears on the calculation
5. Switch to another page → **data is already updated** (no loading spinner)
6. If you had Dashboard open → it automatically shows updated data

### Performance Benefits:
- **No page reloads needed** - data updates in place
- **Instant updates** - other pages already have fresh data
- **Smart caching** - only refetch when data changes
- **Optimistic UI** - fast user experience

## Query Stale Times

Different data has different refresh rates:

| Data Type | Stale Time | Reason |
|-----------|------------|--------|
| Dashboard Stats | 2 minutes | Frequently changing (attendance) |
| Employees | 15 minutes | Rarely changes |
| Attendance | 5 minutes | Updates during working hours |
| Working Days | 15 minutes | Set monthly, rarely changes |
| Salary Calculations | 5 minutes | Updates during calculation period |

## Manual Refresh

Each page has a **Refresh button** for manual data refresh:
- Dashboard → Top right
- Employees → Top right
- Employee Detail → Top right
- Attendance → Top right
- Working Days → Top right

Click it to force an immediate data fetch from the database.

## Technical Implementation

### Hooks Created:
- `useEmployees.js` - Employee data with cache invalidation
- `useAttendance.js` - Attendance data with cache invalidation
- `useWorkingDays.js` - Working days with cache invalidation
- `useDashboard.js` - Dashboard stats with cache invalidation
- `useSalary.js` - **NEW** - Salary calculations with comprehensive invalidation

### Key Features:
1. **Mutation Hooks** - Handle create/update/delete operations
2. **onSuccess Callbacks** - Invalidate related queries after mutations
3. **Query Keys** - Organized structure for cache management
4. **Optimistic Updates** - UI updates before server confirms

## Troubleshooting

### Data Not Updating?
1. Check if you're using React Query hooks (not direct API calls)
2. Look for `refetch` or manual refresh buttons
3. Check browser console for errors
4. Verify database migration was applied

### Stale Data Showing?
1. Click the manual Refresh button
2. Check stale time settings in hooks
3. Verify cache invalidation in mutation hooks

### Performance Issues?
1. Reduce stale times (more frequent refetch)
2. Increase cache time (keep old data longer)
3. Use `enabled: false` for unused queries
4. Implement pagination for large lists

## Related Files

### Hooks (React Query)
- `desktop-app/src/hooks/useEmployees.js`
- `desktop-app/src/hooks/useAttendance.js`
- `desktop-app/src/hooks/useWorkingDays.js`
- `desktop-app/src/hooks/useDashboard.js`
- `desktop-app/src/hooks/useSalary.js` ← **NEW**

### Query Client Setup
- `desktop-app/src/lib/queryClient.js`
- `desktop-app/src/main.jsx` (QueryClientProvider)

### Pages Using Hooks
- `desktop-app/src/pages/Dashboard.jsx`
- `desktop-app/src/pages/Employees.jsx`
- `desktop-app/src/pages/EmployeeDetail.jsx`
- `desktop-app/src/pages/Attendance.jsx`
- `desktop-app/src/pages/WorkingDays.jsx`
- `desktop-app/src/pages/SalaryCalculation.jsx` ← **UPDATED**

## Benefits

✅ **No manual refresh needed** - Data updates automatically
✅ **Fast user experience** - Cached data loads instantly
✅ **Real-time updates** - See changes across all pages
✅ **Offline resilience** - Cached data available offline
✅ **Reduced server load** - Smart caching reduces API calls
✅ **Better UX** - No loading spinners for cached data
