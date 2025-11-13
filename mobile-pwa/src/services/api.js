import { supabase } from './supabase';

// =====================================================
// EMPLOYEE SERVICES
// =====================================================

export const employeeService = {
  // Get all active employees
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

  // Get employees by department
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

  // Get single employee
  async getEmployee(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get employee by ID (alias)
  async getById(id) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new employee
  async createEmployee(employeeData) {
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update employee
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

  // Deactivate employee
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
  // Get attendance for a specific date
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

  // Mark attendance for multiple employees
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

  // Mark single attendance
  async markAttendance(attendanceData) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert([attendanceData], {
        onConflict: 'employee_id,attendance_date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get attendance for employee in date range
  async getEmployeeAttendance(employeeId, startDate, endDate) {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .order('attendance_date', { ascending: false });

    if (startDate) {
      query = query.gte('attendance_date', startDate);
    }
    if (endDate) {
      query = query.lte('attendance_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get attendance by employee and date range (alias with different return format)
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

  // Get monthly attendance summary
  async getMonthlyAttendanceSummary(month, year) {
    const { data, error } = await supabase
      .rpc('get_monthly_attendance_summary', {
        p_month: month,
        p_year: year
      });

    if (error) throw error;
    return data;
  },

  // Update attendance
  async updateAttendance(id, updates) {
    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// WORKING DAYS SERVICES
// =====================================================

export const workingDaysService = {
  // Get working days for month and department
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

  // Get all working days for month
  async getAllWorkingDaysForMonth(month, year) {
    const { data, error } = await supabase
      .from('working_days')
      .select('*')
      .eq('month', month)
      .eq('year', year);

    if (error) throw error;
    return data;
  },

  // Set working days
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
  },

  // Update working days
  async updateWorkingDays(id, updates) {
    const { data, error } = await supabase
      .from('working_days')
      .update(updates)
      .eq('id', id)
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
      const date = new Date(dateStr + 'T00:00:00');
      return date.getDay() === 0;
    };

    // Count total Sundays in the month
    const allDatesInMonth = workingDaysData.working_dates || [];
    const totalSundaysInMonth = allDatesInMonth.filter(dateStr => isSundayDate(dateStr)).length;

    // Count Sundays worked
    const sundaysWorked = attendanceRecords.filter(a => {
      return a.is_present && isSundayDate(a.attendance_date);
    }).length;
    
    // Sundays absent
    const sundaysAbsent = totalSundaysInMonth - sundaysWorked;

    // Calculate attendance statistics (excluding Sundays)
    const totalWorkingDays = workingDaysData.total_working_days;
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Count regular days present
    const regularDaysPresent = attendanceRecords.filter(a => {
      return a.is_present && !isSundayDate(a.attendance_date);
    }).length;
    
    // Count absences on regular days (unpaid only)
    const regularDaysAbsentUnpaid = attendanceRecords.filter(a => {
      return !a.is_present && !a.is_paid_leave && !isSundayDate(a.attendance_date);
    }).length;
    
    // Count paid leaves
    const daysAbsentPaid = attendanceRecords.filter(a => {
      return !a.is_present && a.is_paid_leave && !isSundayDate(a.attendance_date);
    }).length;
    
    // Sunday Compensation Logic
    const sundayCompensationDays = Math.min(sundaysWorked, regularDaysAbsentUnpaid);
    const sundayOvertimeDays = sundaysWorked - sundayCompensationDays;
    
    // Adjust absences after compensation
    const actualUnpaidAbsences = regularDaysAbsentUnpaid - sundayCompensationDays;

    // Calculate salary
    const monthlySalary = parseFloat(employee.monthly_salary);
    const perDayRate = monthlySalary / daysInMonth;
    const deductionAmount = perDayRate * actualUnpaidAbsences;
    const overtimeAmount = perDayRate * sundayOvertimeDays;
    const payableSalary = monthlySalary - deductionAmount + overtimeAmount;

    return {
      employee_id: employeeId,
      month,
      year,
      monthly_salary: monthlySalary,
      total_working_days: totalWorkingDays,
      days_present: regularDaysPresent,
      days_absent_unpaid: regularDaysAbsentUnpaid,
      days_absent_paid: daysAbsentPaid,
      sundays_in_month: totalSundaysInMonth,
      sundays_absent: sundaysAbsent,
      sundays_worked: sundaysWorked,
      sunday_compensation_days: sundayCompensationDays,
      sunday_overtime_days: sundayOvertimeDays,
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
        employees (
          id,
          employee_id,
          full_name,
          department
        )
      `)
      .eq('month', month)
      .eq('year', year)
      .order('calculation_date', { ascending: false });

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
  }
};

