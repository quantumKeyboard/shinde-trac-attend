# User Manual - Shinde Tractors Attendance System

## For Mobile Users (Attendance Marking)

### Daily Attendance Marking

1. **Open the App**
   - Tap the ST Attendance icon on your phone
   - Login with your credentials

2. **Mark Attendance**
   - Date automatically set to today
   - See list of all employees by department
   - For each employee:
     - Tap **Present** (green) if they came to work
     - Tap **Absent** (red) if they didn't come
   
3. **For Absent Employees**
   - When you mark someone absent, you MUST:
     - Type the reason in the text box (required)
     - Check "Paid Leave" box if it's a paid holiday
   
4. **Quick Actions**
   - **Mark All Present**: Sets everyone to present
   - **Mark Dept Present**: Sets entire department to present
   
5. **Save**
   - Scroll down and tap the big blue "Save Attendance" button
   - You'll see "Attendance saved successfully" message

### Working Days Setup

1. **Go to Working Days**
   - Tap the Calendar icon at bottom
   
2. **Select Month and Department**
   - Choose which month
   - Choose which department
   
3. **Mark Working Days**
   - Tap on each date to mark it as a working day
   - Blue dates = working days
   - Quick actions:
     - **All Days**: Marks all 30/31 days
     - **Weekdays**: Marks Monday to Saturday
     - **Clear All**: Removes all selections
   
4. **Save**
   - Tap "Save Working Days" button at bottom

### Tips for Mobile Users

- ✅ Mark attendance at the same time daily (preferably morning)
- ✅ Set working days at the start of each month
- ✅ Always provide clear absence reasons
- ✅ Check the "Employee" tab to see current staff list
- ✅ The app works offline - data will sync when internet returns

---

## For Desktop Users (Management & Reports)

### Dashboard Overview

When you open the desktop app, you see:

1. **Statistics Cards**
   - Total employees
   - Present today
   - Absent today
   - Current month

2. **Top Absentees Panel**
   - Shows employees with most absences this month
   - Sorted from highest to lowest
   - Red number = unpaid leaves
   - Yellow number = paid leaves

3. **Quick Action Buttons**
   - Click to jump to different sections

### Managing Employees

1. **Add New Employee**
   - Click "Add Employee" button (top right)
   - Fill in the form:
     - Full Name: Required
     - Department: Choose from dropdown
     - Monthly Salary: Enter amount in ₹
     - Contact Number: Optional (for WhatsApp)
     - Date of Joining: Select date
   - Click "Add Employee"
   - Employee ID will be auto-generated (EMP001, EMP002, etc.)

2. **Edit Employee**
   - Find employee card
   - Click "Edit" button
   - Update information
   - Click "Update Employee"

3. **Deactivate Employee**
   - When an employee leaves the company
   - Click "Deactivate" button on their card
   - Confirm the action
   - They won't appear in attendance marking anymore

4. **Search & Filter**
   - Use search box to find by name or ID
   - Filter by department
   - Filter by status (Active/Inactive)

### Month-End Salary Processing

**Do this at the end of each month:**

1. **Ensure Working Days Are Set**
   - Go to Working Days page
   - Verify all departments have working days configured
   - If not set, you cannot calculate salaries

2. **Go to Salary Page**
   - Click "Salary" in sidebar

3. **Calculate Salaries**
   - Select month and year
   - Click "Calculate for All Employees"
   - System will automatically:
     - Get working days for each department
     - Count present/absent days
     - Calculate per-day rate
     - Calculate deductions for unpaid absences
     - Calculate final payable salary

4. **Review Calculations**
   - Check each employee's calculation
   - Formula shown:
     ```
     Per Day Rate = Monthly Salary ÷ Working Days
     Deduction = Per Day Rate × Unpaid Absent Days
     Payable Salary = Monthly Salary - Deduction
     ```

5. **Generate Summaries**
   - Click "Generate Summary" for an employee
   - Choose format:
     - **WhatsApp Text**: Copy-paste to send via WhatsApp
     - **Salary Card**: Download professional image
     - **Both**: Get both formats
   
6. **Bulk Export**
   - Click "Generate All Summaries"
   - Downloads folder with all employee summaries
   - Individual text files + image cards for each employee

### Generating Reports

1. **Monthly Attendance Report**
   - Go to Reports page
   - Click "Export Monthly Attendance"
   - Select month and year
   - Click "Export to Excel"
   - Choose save location
   - Excel file includes:
     - Employee details
     - Days present/absent
     - Paid vs unpaid leaves
     - Summary statistics

2. **Salary Report**
   - Click "Export Salary Report"
   - Select month and year
   - Excel file includes:
     - All salary calculations
     - Breakdown by employee
     - Total summary
     - Formulas included

3. **Employee Report**
   - Choose specific employee
   - Click "Export Employee Report"
   - Complete history for that employee

4. **Department Report**
   - Filter by department
   - Click "Export Department Report"
   - All employees in that department

### Settings Configuration

1. **Company Settings**
   - Set company name (appears in reports)
   
2. **Security Settings**
   - **Session Timeout**: Auto-logout time (default: 30 min)
   - **Max Past Edit Days**: How many days back can edit attendance (default: 3)
   
3. **Backup Settings**
   - **Auto Backup**: Enable weekly automatic backups
   - **Backup Now**: Manually backup database
   - **Restore**: Restore from a previous backup

4. **Notification Settings**
   - Configure alerts for high absences
   - Set absence threshold

### Sending Salary Information

**Via WhatsApp (Text)**:
1. Generate WhatsApp message for employee
2. Click "Copy to Clipboard"
3. Open WhatsApp on your phone
4. Find employee's contact
5. Paste and send

**Via WhatsApp (Image Card)**:
1. Generate salary card for employee
2. Download the image (PNG file)
3. Transfer to phone or send via WhatsApp Web
4. Send image to employee

**Best Practice**: Send both text and image for clarity

---

## Common Workflows

### Workflow 1: New Month Setup

**Do this at the start of every month:**

1. **Desktop App**:
   - Review active employees
   - Add any new joiners
   - Deactivate any who left last month

2. **Mobile/Desktop App**:
   - Go to Working Days
   - Set working days for current month
   - Do this for ALL three departments:
     - Salesman
     - Mechanic
     - Housekeeping

3. **Ready to mark attendance!**

### Workflow 2: Daily Operations

**Every working day:**

1. **Mobile App** (Morning/Evening):
   - Open app
   - Mark today's attendance
   - Mark present for who came
   - Mark absent with reason for who didn't
   - Save

2. **Desktop App** (Optional):
   - Check dashboard
   - Monitor absentee trends
   - Take action if needed

### Workflow 3: Month-End Processing

**Last day of month or first day of next month:**

1. **Verify Completeness**:
   - Check all days have attendance marked
   - Verify working days are correct

2. **Calculate Salaries**:
   - Go to Salary page
   - Calculate for all employees
   - Review calculations

3. **Generate Summaries**:
   - Generate for all employees
   - Download WhatsApp messages and salary cards

4. **Distribute Information**:
   - Send to each employee via WhatsApp
   - Keep copies for records

5. **Export Reports**:
   - Export monthly attendance report
   - Export salary report
   - Save to company folder

6. **Backup**:
   - Go to Settings
   - Click "Backup Now"
   - Save backup file to safe location

---

## Frequently Asked Questions

### Q: Can I mark attendance for past dates?
**A:** Yes, but only up to 3 days in the past (configurable in Settings). You'll see a warning when editing old attendance.

### Q: Can I mark attendance for future dates?
**A:** No, the system will not allow this to prevent data errors.

### Q: What if I forget to mark attendance for a day?
**A:** You can go back and mark it (within 3 days). Select the date at the top and mark attendance as normal.

### Q: What's the difference between paid and unpaid leave?
**A:** 
- **Unpaid Leave**: Salary will be deducted for that day
- **Paid Leave**: No salary deduction (holidays, sick leave, etc.)

### Q: Can I change an employee's salary mid-month?
**A:** Yes, but the salary calculation will use the salary value at the time of calculation. Best to make changes at month start.

### Q: What if working days are different for employees in the same department?
**A:** Currently, working days are set per department. All employees in a department have the same working days.

### Q: How do I backup my data?
**A:** 
1. Automatic: Enable auto-backup in Settings (weekly)
2. Manual: Go to Settings > Backup Now
3. Reports: Export Excel reports regularly

### Q: Can multiple people mark attendance at the same time?
**A:** Yes! Both mobile and desktop can be used simultaneously. The database syncs automatically.

### Q: What happens if internet is down?
**A:** Mobile app works offline and syncs when internet returns. Desktop app needs internet to connect to database.

### Q: How do I install the mobile app on phone?
**A:** 
1. Open the website in phone's Chrome browser
2. Tap menu (three dots) at top right
3. Select "Add to Home Screen" or "Install app"
4. App icon will appear on home screen

### Q: Can I delete an employee?
**A:** No, but you can "Deactivate" them. This preserves all their historical data while removing them from active lists.

### Q: How accurate are the salary calculations?
**A:** 100% accurate. The system uses the exact formula:
- Per Day Rate = Monthly Salary ÷ Working Days
- Deduction = Per Day Rate × Unpaid Absent Days
- Payable = Monthly Salary - Deduction

---

## Error Messages & Solutions

| Error Message | What It Means | Solution |
|--------------|---------------|----------|
| "Cannot mark attendance for future dates" | You tried to select a date in the future | Select today or a past date |
| "Please provide absence reason" | You marked someone absent without reason | Type a reason in the text box |
| "Working days not set" | Trying to calculate salary before setting working days | Go to Working Days and configure for that month/department |
| "Invalid credentials" | Wrong email or password | Check your login details, or contact admin |
| "Connection failed" | No internet or database issue | Check internet connection, try again |
| "Warning: editing old attendance" | Trying to edit attendance older than 3 days | Proceed with caution, or contact admin |

---

## Best Practices

### For Attendance Markers
- ✅ Mark attendance at a consistent time daily
- ✅ Always provide clear, specific absence reasons
- ✅ Double-check before saving
- ✅ Set working days at the start of each month
- ✅ Report any issues immediately

### For Administrators
- ✅ Review dashboard daily
- ✅ Monitor the "Top Absentees" panel
- ✅ Address high absence rates promptly
- ✅ Generate reports monthly for records
- ✅ Backup data regularly
- ✅ Keep employee information updated
- ✅ Verify salary calculations before distribution

### For Everyone
- ✅ Keep login credentials secure
- ✅ Logout when done
- ✅ Report bugs or issues to admin
- ✅ Don't share your account with others

---

## Support & Help

**Need Help?**
1. Check this manual first
2. Look for error messages and solutions above
3. Contact your system administrator
4. Check the SETUP_GUIDE.md for technical issues

**Found a Bug?**
- Note what you were doing when it happened
- Take a screenshot if possible
- Report to administrator with details

**Feature Requests?**
- Discuss with management
- Document the requirement clearly
- Consult with system administrator

---

## Quick Reference Card

**Mobile App**:
- 🏠 Home = Mark Attendance
- 👥 Employees = View staff list
- 📅 Working Days = Set working days

**Desktop App**:
- 📊 Dashboard = Overview
- 👥 Employees = Manage staff
- ✅ Attendance = View records
- 📅 Working Days = Configure
- 💰 Salary = Calculate & distribute
- 📄 Reports = Export data
- ⚙️ Settings = Configuration

**Month-End Checklist**:
1. ✅ All attendance marked
2. ✅ Working days verified
3. ✅ Salaries calculated
4. ✅ Summaries generated
5. ✅ Sent to employees
6. ✅ Reports exported
7. ✅ Data backed up

---

**Version**: 1.0.0  
**Last Updated**: October 28, 2025

© 2025 Shinde Tractors - All Rights Reserved
