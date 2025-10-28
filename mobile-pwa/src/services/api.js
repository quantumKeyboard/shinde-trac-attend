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
