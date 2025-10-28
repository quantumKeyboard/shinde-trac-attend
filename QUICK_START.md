# Quick Start Checklist

## ⚡ Get Up and Running in 30 Minutes

Follow this checklist to get your attendance system operational quickly.

---

## Phase 1: Supabase Setup (10 minutes)

- [ ] Go to [supabase.com](https://supabase.com) and create account
- [ ] Create new project named "shinde-tractors-attendance"
- [ ] Save database password securely
- [ ] Copy Project URL: `https://xxxxx.supabase.co`
- [ ] Copy anon key: `eyJhbGc...`
- [ ] Go to SQL Editor
- [ ] Copy content from `database/schema.sql`
- [ ] Paste and click "Run"
- [ ] Verify success message
- [ ] Go to Authentication > Users
- [ ] Add user 1: `owner@shindetractors.com` with password
- [ ] Add user 2: `manager@shindetractors.com` with password
- [ ] Save both credentials in a safe place

**✓ Database is ready!**

---

## Phase 2: Mobile PWA Setup (10 minutes)

- [ ] Open PowerShell/Terminal
- [ ] Navigate: `cd "d:\Projects\ShindeTractors Employee Attendance\mobile-pwa"`
- [ ] Run: `npm install` (wait 2-3 minutes)
- [ ] Copy: `copy .env.example .env`
- [ ] Edit `.env` file with your Supabase URL and key
- [ ] Save `.env` file
- [ ] Run: `npm run dev`
- [ ] Open browser: `http://localhost:5173`
- [ ] Login with one of your user accounts
- [ ] Verify you see the attendance page

**✓ Mobile PWA is running!**

---

## Phase 3: Desktop App Setup (10 minutes)

- [ ] Open NEW PowerShell/Terminal window
- [ ] Navigate: `cd "d:\Projects\ShindeTractors Employee Attendance\desktop-app"`
- [ ] Run: `npm install` (wait 2-3 minutes)
- [ ] Copy: `copy .env.example .env`
- [ ] Edit `.env` file with SAME Supabase credentials
- [ ] Save `.env` file
- [ ] Run: `npm run dev`
- [ ] Wait for Electron window to open
- [ ] Login with same user account
- [ ] Verify you see the dashboard

**✓ Desktop app is running!**

---

## Phase 4: Initial Data Setup (5 minutes)

### Add Test Employees (Desktop App)

- [ ] Click "Employees" in sidebar
- [ ] Click "Add Employee" button
- [ ] Add first employee:
  - Name: `John Doe`
  - Department: `Salesman`
  - Salary: `25000`
  - Contact: `9876543210`
  - Date: Select today
- [ ] Click "Add Employee"
- [ ] Note the Employee ID (EMP001)
- [ ] Add 2-3 more test employees in different departments

### Set Working Days (Mobile PWA)

- [ ] Switch to browser with mobile PWA
- [ ] Click "Working Days" tab (calendar icon)
- [ ] Select current month
- [ ] Select "Salesman" department
- [ ] Click "Weekdays" button (marks Mon-Sat)
- [ ] Click "Save Working Days"
- [ ] Repeat for "Mechanic" department
- [ ] Repeat for "Housekeeping" department

### Mark Test Attendance (Mobile PWA)

- [ ] Click "Attendance" tab (home icon)
- [ ] See list of employees you added
- [ ] Mark some present (green button)
- [ ] Mark some absent (red button)
- [ ] For absent ones: enter reason "Test absence"
- [ ] Scroll down
- [ ] Click "Save Attendance"
- [ ] See success message

**✓ Initial data is loaded!**

---

## Phase 5: Verification (5 minutes)

### Check Desktop Dashboard

- [ ] Switch to desktop app
- [ ] Dashboard should show:
  - Total employees count
  - Today's present/absent count
  - Statistics updated

### Test Employee Management

- [ ] Go to "Employees" page
- [ ] Search for an employee by name
- [ ] Filter by department
- [ ] Click "Edit" on an employee
- [ ] Change something (e.g., contact number)
- [ ] Save and verify changes

### Test Reports (Quick Check)

- [ ] Go to "Reports" page
- [ ] See export options available
- [ ] (Don't need to export yet, just verify page works)

**✓ System is fully operational!**

---

## ✅ Success Criteria

You should now have:

1. ✅ Supabase project with database tables
2. ✅ User accounts created
3. ✅ Mobile PWA running and accessible
4. ✅ Desktop app running
5. ✅ Test employees added
6. ✅ Working days configured
7. ✅ Attendance marked
8. ✅ Dashboard showing data

---

## 🎯 What To Do Next

### For Immediate Use:

1. **Add Real Employees**
   - Use desktop app to add all actual employees
   - Include accurate salary and contact information

2. **Configure This Month's Working Days**
   - Set actual working days for all departments
   - Review and adjust as needed

3. **Start Daily Attendance**
   - Use mobile PWA every day to mark attendance
   - Ensure reasons are provided for absences

### For Production Deployment:

1. **Deploy Mobile PWA**
   - Use Netlify or Vercel (instructions in SETUP_GUIDE.md)
   - Share URL with mobile users
   - Help them install as app on phones

2. **Build Desktop Installer**
   - Run `npm run build:win` in desktop-app folder
   - Install on office PCs
   - Create desktop shortcuts

3. **Setup Backups**
   - Enable auto-backup in Settings
   - Schedule weekly manual backups
   - Export important reports to Excel

---

## 📚 Documentation Reference

- **Detailed Setup**: See `SETUP_GUIDE.md`
- **User Instructions**: See `USER_MANUAL.md`
- **Technical Details**: See `README.md` files
- **Complete Overview**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Quick Troubleshooting

### "npm: command not found"
**Fix**: Install Node.js from nodejs.org, restart PowerShell

### "Port already in use"
**Fix**: Close previous terminal windows, try again

### "Connection failed"
**Fix**: Check .env file has correct Supabase credentials

### "Tables not found"
**Fix**: Run database/schema.sql again in Supabase SQL Editor

### Login fails
**Fix**: Verify user was created in Supabase Authentication section

---

## 💡 Pro Tips

1. **Keep Both Running**: Have mobile PWA and desktop app open simultaneously for testing
2. **Use Real Data**: Add actual employees and real working days to test properly
3. **Test Month-End**: Set a past month's working days and attendance to test salary calculation
4. **Bookmark URLs**: Save `http://localhost:5173` and `http://localhost:5174` for quick access
5. **Save Credentials**: Keep your Supabase URL, keys, and user passwords in a secure note

---

## 🎉 You're Done!

**Total Time**: ~30-35 minutes

Your complete attendance and salary management system is now:
- ✅ Installed
- ✅ Configured  
- ✅ Running
- ✅ Tested
- ✅ Ready for production use!

---

## 📞 Need Help?

1. Check error messages in the terminal
2. Review the specific documentation file for your issue
3. Verify all steps in this checklist were completed
4. Ensure .env files have correct credentials

---

**Next Steps**: Read USER_MANUAL.md to learn all features, or start using it right away!

**Happy Managing!** 🚀
