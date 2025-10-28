# Attendance Correction Guide

## How to Update/Correct Attendance Records

### ✅ Attendance records are **FULLY EDITABLE** in this system!

If you marked someone as absent by mistake, or need to change any attendance record, you can easily update it.

## Methods to Update Attendance:

### 1. **Re-mark Attendance (Recommended)**
The simplest way to correct attendance:

**Steps:**
1. Go to **Attendance** page (available in both Mobile PWA and Desktop app)
2. Select the date you want to correct
3. Change the status (Present ↔ Absent)
4. Update absence reasons or paid leave status
5. Click **Save Attendance**

**What happens:**
- The system uses `UPSERT` which means it will **UPDATE** existing records instead of creating duplicates
- The unique constraint on `(employee_id, attendance_date)` ensures only one record exists per employee per day
- Previous data is overwritten with new data

### 2. **Edit from Employee Detail Page**
Currently, the employee detail page is **view-only**, but you can use the Attendance page to make corrections.

## Database Support:

### ✅ The database is designed for updates:
```sql
-- Attendance table has update tracking fields:
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_by UUID REFERENCES auth.users(id)

-- Unique constraint prevents duplicates:
UNIQUE(employee_id, attendance_date)
```

### ✅ The API supports updates:
```javascript
// In attendanceService.markAttendance()
await supabase
  .from('attendance')
  .upsert([attendanceData], {
    onConflict: 'employee_id,attendance_date'  // Updates if exists
  })
```

## Common Scenarios:

### Scenario 1: Marked Absent, Should be Present
1. Go to Attendance page
2. Select the date
3. Click on the employee
4. Toggle to **Present**
5. Save

**Result:** Absence record is updated to Present, reason is cleared

### Scenario 2: Marked Present, Should be Absent
1. Go to Attendance page
2. Select the date  
3. Click on the employee
4. Toggle to **Absent**
5. Enter absence reason
6. Check "Paid Leave" if applicable
7. Save

**Result:** Present record is updated to Absent with reason

### Scenario 3: Change Absence Reason
1. Go to Attendance page
2. Select the date
3. The employee is already marked absent
4. Edit the absence reason text
5. Toggle paid leave status if needed
6. Save

**Result:** Absence reason is updated

### Scenario 4: Change Paid/Unpaid Status
1. Go to Attendance page
2. Select the date
3. Check/uncheck "Paid Leave" checkbox
4. Save

**Result:** Leave type is updated, affects salary calculation

## Important Notes:

### 🔄 **Auto-update Timestamps**
- Every attendance update automatically updates the `updated_at` field
- The `updated_by` field tracks who made the change (for audit trail)

### 💰 **Salary Recalculation**
- When you update attendance, **recalculate salaries** for that month
- Go to employee detail page and regenerate reports with updated data
- Excel exports will show the corrected attendance

### 📊 **Audit Trail**
- All attendance changes are logged
- The system tracks who made changes and when
- Original `marked_at` timestamp is preserved
- Update timestamp shows when it was corrected

### ⚠️ **Validation**
- Cannot mark attendance for future dates (blocked by database trigger)
- Must provide absence reason for absent employees
- Paid leave checkbox only matters when absent

## Best Practices:

1. **Double-check before saving** - Review the attendance before clicking save
2. **Correct immediately** - Fix mistakes as soon as you notice them
3. **Document reasons** - Always provide clear absence reasons
4. **Recalculate salaries** - After corrections, regenerate salary reports
5. **Use audit logs** - Check who made changes if there are disputes

## Example Correction Flow:

```
Day 1: ❌ Accidentally marked John as Absent (sick leave)
Day 2: 🔍 Realized John was actually Present that day
Action: 
  1. Open Attendance page
  2. Select Day 1 date
  3. Find John in the list
  4. Toggle from Absent to Present  
  5. Click Save
Result: ✅ John's record now shows Present, sick leave reason removed
```

## Database Migration Note:

If you have an existing database, the attendance table already supports updates out of the box. No migration needed!

The `updated_at` trigger automatically updates the timestamp on every change:
```sql
CREATE TRIGGER update_attendance_updated_at 
  BEFORE UPDATE ON attendance
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Future Enhancement Ideas:

- ✨ Add "Edit" button in Employee Detail page for quick corrections
- ✨ Show edit history/audit log in UI
- ✨ Add bulk correction feature for multiple employees
- ✨ Add confirmation dialog for attendance changes
- ✨ Show "Last updated by" information in UI

---

**Summary:** Attendance is fully editable! Just go to the Attendance page, select the date, and re-mark with the correct status. The system will update the existing record automatically. 🎉
