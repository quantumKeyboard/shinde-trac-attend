import { supabase } from './supabase';

// =====================================================
// EMPLOYEE SERVICES
// =====================================================

export const employeeService = {
  async getActiveEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'Active')
      .order('department', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getAllEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getEmployeesByDepartment(department) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('department', department)
      .eq('status', 'Active')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEmployee(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createEmployee(employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEmployee(id, employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .update(employeeData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deactivateEmployee(id) {
    const { data, error } = await supabase
      .from('employees')
      .update({ status: 'Inactive' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// ATTENDANCE SERVICES
// =====================================================

export const attendanceService = {
  async getAttendanceByDate(date) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          employee_id,
          full_name,
          department
        )
      `)
      .eq('attendance_date', date);

    if (error) throw error;
    return data;
  },

  async getAttendanceByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          employee_id,
          full_name,
          department
        )
      `)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getEmployeeAttendance(employeeId, startDate, endDate) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('attendance_date', { ascending: false });

    if (startDate) query = query.gte('attendance_date', startDate);
    if (endDate) query = query.lte('attendance_date', endDate);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getByEmployeeAndDateRange(employeeId, startDate, endDate) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: true });

    if (error) throw error;
    return data.map(record => ({
      ...record,
      date: record.attendance_date
    }));
  },

  async getMonthlyAttendance(month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    return await attendanceService.getAttendanceByDateRange(startDate, endDate);
  },

  async markBulkAttendance(attendanceRecords) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, {
        onConflict: 'employee_id,attendance_date'
      })
      .select();

    if (error) throw error;
    return data;
  },

  async updateAttendance(id, updates) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAbsenteesSummary(month, year) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        employees (
          id,
          employee_id,
          full_name,
          department
        )
      `)
      .eq('is_present', false)
      .gte('attendance_date', startDate)
      .lte('attendance_date', endDate)
      .order('attendance_date', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// =====================================================
// WORKING DAYS SERVICES
// =====================================================

export const workingDaysService = {
  async getWorkingDays(month, year, department) {
    const { data, error } = await supabase
      .from('working_days')
      .select('*')
      .eq('month', month)
      .eq('year', year)
      .eq('department', department)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllWorkingDaysForMonth(month, year) {
    const { data, error } = await supabase
      .from('working_days')
      .select('*')
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    return data;
  },

  async setWorkingDays(workingDaysData) {
    const { data, error } = await supabase
      .from('working_days')
      .upsert([workingDaysData], {
        onConflict: 'month,year,department'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// SALARY CALCULATION SERVICES
// =====================================================

export const salaryService = {
  async calculateMonthlySalary(employeeId, month, year) {
    // Get employee details
    const employee = await employeeService.getEmployee(employeeId);
    
    // Get working days for employee's department
    const workingDaysData = await workingDaysService.getWorkingDays(
      month,
      year,
      employee.department
    );

    if (!workingDaysData) {
      throw new Error('Working days not set for this month and department');
    }

    // Get attendance for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const attendanceRecords = await attendanceService.getEmployeeAttendance(
      employeeId,
      startDate,
      endDate
    );

    // Helper function to check if a date is Sunday
    const isSundayDate = (dateStr) => {
      const date = new Date(dateStr + 'T00:00:00'); // Add time to avoid timezone issues
      return date.getDay() === 0;
    };

    // Count total Sundays in the month (from working_dates array)
    const allDatesInMonth = workingDaysData.working_dates || [];
    const totalSundaysInMonth = allDatesInMonth.filter(dateStr => isSundayDate(dateStr)).length;

    // Count Sundays worked (only those with attendance records marked as present)
    const sundaysWorked = attendanceRecords.filter(a => {
      return a.is_present && isSundayDate(a.attendance_date);
    }).length;
    
    // Sundays absent = Total Sundays - Sundays Worked (no attendance record means they didn't work, which is fine)
    const sundaysAbsent = totalSundaysInMonth - sundaysWorked;

    // Calculate attendance statistics (excluding Sundays from normal calculation)
    const totalWorkingDays = workingDaysData.total_working_days;
    
    // Calculate total days in the month for per-day rate
    const daysInMonth = new Date(year, month, 0).getDate(); // Gets actual days in month (28-31)
    
    // Count normal working days (non-Sunday) present
    const regularDaysPresent = attendanceRecords.filter(a => {
      return a.is_present && !isSundayDate(a.attendance_date);
    }).length;
    
    // Count absences on regular days (not Sundays) - unpaid only
    const regularDaysAbsentUnpaid = attendanceRecords.filter(a => {
      // Only count as absent if it's NOT a Sunday and it's unpaid
      return !a.is_present && !a.is_paid_leave && !isSundayDate(a.attendance_date);
    }).length;
    
    // Count paid leaves (excluding Sundays)
    const daysAbsentPaid = attendanceRecords.filter(a => {
      return !a.is_present && a.is_paid_leave && !isSundayDate(a.attendance_date);
    }).length;
    
    // Sunday Compensation Logic:
    // 1. First, use Sunday work to compensate unpaid absences on regular days (1 Sunday = 1 Absence)
    // 2. Remaining Sunday work counts as overtime (paid extra)
    const sundayCompensationDays = Math.min(sundaysWorked, regularDaysAbsentUnpaid);
    const sundayOvertimeDays = sundaysWorked - sundayCompensationDays;
    
    // Adjust actual unpaid absences after Sunday compensation
    const actualUnpaidAbsences = regularDaysAbsentUnpaid - sundayCompensationDays;

    // Calculate salary - Per day rate is monthly salary divided by days in month (not working days)
    const monthlySalary = parseFloat(employee.monthly_salary);
    const perDayRate = monthlySalary / daysInMonth; // Simplified: Use actual days in month
    const deductionAmount = perDayRate * actualUnpaidAbsences; // Deduct only after compensation
    const overtimeAmount = perDayRate * sundayOvertimeDays; // Pay for overtime Sundays
    const payableSalary = monthlySalary - deductionAmount + overtimeAmount;

    return {
      employee_id: employeeId,
      month,
      year,
      monthly_salary: monthlySalary,
      total_working_days: totalWorkingDays,
      days_present: regularDaysPresent, // Regular days present
      days_absent_unpaid: regularDaysAbsentUnpaid, // Original unpaid count (before compensation)
      days_absent_paid: daysAbsentPaid,
      sundays_in_month: totalSundaysInMonth, // Total Sundays in the month
      sundays_absent: sundaysAbsent, // Sundays absent (no penalty - paid holiday)
      sundays_worked: sundaysWorked, // Sundays worked
      sunday_compensation_days: sundayCompensationDays, // Sundays used to compensate absences
      sunday_overtime_days: sundayOvertimeDays, // Sundays paid as overtime
      per_day_rate: perDayRate,
      deduction_amount: deductionAmount,
      overtime_amount: overtimeAmount,
      payable_salary: payableSalary
    };
  },

  async saveSalaryCalculation(calculationData) {
    const { data, error } = await supabase
      .from('salary_calculations')
      .upsert([calculationData], {
        onConflict: 'employee_id,month,year'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getSalaryCalculation(employeeId, month, year) {
    const { data, error } = await supabase
      .from('salary_calculations')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getMonthlySalaryCalculations(month, year) {
    const { data, error } = await supabase
      .from('salary_calculations')
      .select(`
        *,
        employees!inner (
          id,
          employee_id,
          full_name,
          department
        )
      `)
      .eq('month', month)
      .eq('year', year)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async finalizeSalaryCalculation(id) {
    const { data, error } = await supabase
      .from('salary_calculations')
      .update({
        is_finalized: true,
        finalized_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// AUDIT LOG SERVICE
// =====================================================

export const auditService = {
  async logAction(action, tableName, recordId, oldValues, newValues) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAuditLogs(filters = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.action) query = query.eq('action', filters.action);
    if (filters.tableName) query = query.eq('table_name', filters.tableName);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// =====================================================
// SYSTEM SETTINGS SERVICE
// =====================================================

export const settingsService = {
  async getSetting(key) {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .single();

    if (error) throw error;
    return data;
  },

  async updateSetting(key, value) {
    const { data, error } = await supabase
      .from('system_settings')
      .update({ setting_value: value })
      .eq('setting_key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
