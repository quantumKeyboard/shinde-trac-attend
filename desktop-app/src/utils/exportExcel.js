import ExcelJS from 'exceljs';
import { format } from 'date-fns';

// Helper to save file (works in Electron environment)
const saveFile = async (buffer, filename) => {
  if (window.electron && window.electron.ipcRenderer) {
    // Electron environment
    const { ipcRenderer } = window.electron;
    const { filePath, canceled } = await ipcRenderer.invoke('save-file-dialog', {
      defaultPath: filename,
      filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    });

    if (!canceled && filePath) {
      await ipcRenderer.invoke('save-file', {
        filePath,
        data: Buffer.from(buffer),
        encoding: 'binary'
      });
      return filePath;
    }
  } else {
    // Browser fallback
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  return filename;
};

// =====================================================
// MONTHLY ATTENDANCE REPORT
// =====================================================
export const exportMonthlyAttendance = async (attendanceData, employees, month, year) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Attendance');

  // Set up title
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Attendance Report - ${format(new Date(year, month - 1), 'MMMM yyyy')}`;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Headers
  const headerRow = worksheet.addRow([
    'Employee ID',
    'Employee Name',
    'Department',
    'Days Present',
    'Days Absent (Unpaid)',
    'Days Absent (Paid)',
    'Total Absences',
    'Remarks'
  ]);

  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Group attendance by employee
  const employeeAttendance = {};
  attendanceData.forEach(record => {
    const empId = record.employee_id;
    if (!employeeAttendance[empId]) {
      employeeAttendance[empId] = {
        present: 0,
        absentUnpaid: 0,
        absentPaid: 0
      };
    }

    if (record.is_present) {
      employeeAttendance[empId].present++;
    } else if (record.is_paid_leave) {
      employeeAttendance[empId].absentPaid++;
    } else {
      employeeAttendance[empId].absentUnpaid++;
    }
  });

  // Add data rows
  employees.forEach(emp => {
    const stats = employeeAttendance[emp.id] || { present: 0, absentUnpaid: 0, absentPaid: 0 };
    const totalAbsences = stats.absentUnpaid + stats.absentPaid;

    worksheet.addRow([
      emp.employee_id || 'N/A',
      emp.full_name || 'Unknown',
      emp.department || 'N/A',
      stats.present,
      stats.absentUnpaid,
      stats.absentPaid,
      totalAbsences,
      totalAbsences > 5 ? 'High absence rate' : ''
    ]);
  });

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  // Generate buffer and save
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Attendance_${format(new Date(year, month - 1), 'MMM_yyyy')}.xlsx`;
  return await saveFile(buffer, filename);
};

// =====================================================
// SALARY REPORT
// =====================================================
export const exportSalaryReport = async (salaryData, month, year) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Salary Report');

  // Title
  worksheet.mergeCells('A1:J1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Salary Report - ${format(new Date(year, month - 1), 'MMMM yyyy')}`;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  // Headers
  const headerRow = worksheet.addRow([
    'Employee ID',
    'Employee Name',
    'Department',
    'Monthly Salary',
    'Working Days',
    'Days Present',
    'Unpaid Absences',
    'Per Day Rate',
    'Deduction',
    'Payable Salary'
  ]);

  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' }
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  // Add data
  salaryData.forEach(record => {
    const row = worksheet.addRow([
      record.employees?.employee_id || 'N/A',
      record.employees?.full_name || 'N/A',
      record.employees?.department || 'N/A',
      record.monthly_salary,
      record.total_working_days,
      record.days_present,
      record.days_absent_unpaid,
      record.per_day_rate,
      record.deduction_amount,
      record.payable_salary
    ]);

    // Format currency cells
    [4, 8, 9, 10].forEach(colNum => {
      const cell = row.getCell(colNum);
      cell.numFmt = '₹#,##0.00';
    });
  });

  // Summary row
  worksheet.addRow([]);
  const summaryRow = worksheet.addRow([
    '', '', 'TOTAL:',
    { formula: `SUM(D3:D${worksheet.rowCount - 1})` },
    '',
    { formula: `SUM(F3:F${worksheet.rowCount - 1})` },
    { formula: `SUM(G3:G${worksheet.rowCount - 1})` },
    '',
    { formula: `SUM(I3:I${worksheet.rowCount - 1})` },
    { formula: `SUM(J3:J${worksheet.rowCount - 1})` }
  ]);
  
  summaryRow.font = { bold: true };
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' }
  };

  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Salary_${format(new Date(year, month - 1), 'MMM_yyyy')}.xlsx`;
  return await saveFile(buffer, filename);
};

// =====================================================
// EMPLOYEE REPORT
// =====================================================
export const exportEmployeeReport = async (employee, attendanceData, salaryData) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Employee Report');

  // Employee Details
  worksheet.mergeCells('A1:D1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Employee Report: ${employee.full_name}`;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };

  worksheet.addRow([]);
  worksheet.addRow(['Employee ID:', employee.employee_id]);
  worksheet.addRow(['Department:', employee.department]);
  worksheet.addRow(['Monthly Salary:', `₹${employee.monthly_salary}`]);
  worksheet.addRow(['Contact:', employee.contact_number]);
  worksheet.addRow(['Date of Joining:', format(new Date(employee.date_of_joining), 'dd/MM/yyyy')]);

  // Attendance History
  worksheet.addRow([]);
  worksheet.addRow(['Attendance History']).font = { bold: true, size: 14 };
  
  const attendanceHeader = worksheet.addRow(['Date', 'Status', 'Paid Leave', 'Reason']);
  attendanceHeader.font = { bold: true };

  attendanceData.forEach(record => {
    worksheet.addRow([
      format(new Date(record.attendance_date), 'dd/MM/yyyy'),
      record.is_present ? 'Present' : 'Absent',
      record.is_paid_leave ? 'Yes' : 'No',
      record.absence_reason || '-'
    ]);
  });

  // Salary History
  if (salaryData && salaryData.length > 0) {
    worksheet.addRow([]);
    worksheet.addRow(['Salary History']).font = { bold: true, size: 14 };
    
    const salaryHeader = worksheet.addRow([
      'Month', 'Working Days', 'Present', 'Absent (Unpaid)', 'Deduction', 'Payable'
    ]);
    salaryHeader.font = { bold: true };

    salaryData.forEach(record => {
      worksheet.addRow([
        format(new Date(record.year, record.month - 1), 'MMM yyyy'),
        record.total_working_days,
        record.days_present,
        record.days_absent_unpaid,
        `₹${record.deduction_amount.toFixed(2)}`,
        `₹${record.payable_salary.toFixed(2)}`
      ]);
    });
  }

  worksheet.columns.forEach(column => {
    column.width = 20;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `Employee_${employee.employee_id}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  return await saveFile(buffer, filename);
};
