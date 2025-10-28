import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { employeeService, attendanceService, workingDaysService, salaryService } from '../services/api';
import { exportMonthlyAttendance, exportSalaryReport, exportEmployeeReport } from '../utils/exportExcel';

export default function Reports() {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const handleExportAttendance = async () => {
    try {
      setExporting(true);
      toast.loading('Generating attendance report...');
      
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      
      // Get all employees
      const employees = selectedDepartment === 'All' 
        ? await employeeService.getAllEmployees()
        : await employeeService.getEmployeesByDepartment(selectedDepartment);
      
      // Get attendance for the month
      const attendance = await attendanceService.getAttendanceByDateRange(startDate, endDate);
      
      // Export to Excel
      await exportMonthlyAttendance(employees, attendance, month, year);
      
      toast.dismiss();
      toast.success('Attendance report exported successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Failed to export attendance report');
    } finally {
      setExporting(false);
    }
  };

  const handleExportSalary = async () => {
    try {
      setExporting(true);
      toast.loading('Generating salary report...');
      
      const [year, month] = selectedMonth.split('-');
      
      // Get all employees
      const employees = selectedDepartment === 'All'
        ? await employeeService.getAllEmployees()
        : await employeeService.getEmployeesByDepartment(selectedDepartment);
      
      // Calculate salaries for all employees
      const salaryData = [];
      for (const employee of employees) {
        try {
          const salary = await salaryService.calculateMonthlySalary(
            employee.id,
            parseInt(month),
            parseInt(year)
          );
          salaryData.push({
            ...employee,
            ...salary
          });
        } catch (error) {
          console.error(`Error calculating salary for ${employee.full_name}:`, error);
        }
      }
      
      // Export to Excel
      await exportSalaryReport(salaryData, month, year);
      
      toast.dismiss();
      toast.success('Salary report exported successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Failed to export salary report');
    } finally {
      setExporting(false);
    }
  };

  const handleExportEmployee = async () => {
    try {
      setExporting(true);
      toast.loading('Generating employee report...');
      
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-31`;
      
      // Get all employees
      const employees = selectedDepartment === 'All'
        ? await employeeService.getAllEmployees()
        : await employeeService.getEmployeesByDepartment(selectedDepartment);
      
      // Get attendance for each employee
      const employeeData = [];
      for (const employee of employees) {
        const attendance = await attendanceService.getEmployeeAttendance(
          employee.id,
          startDate,
          endDate
        );
        
        // Get working days
        const workingDaysData = await workingDaysService.getByDepartmentAndMonth(
          employee.department,
          `${year}-${month}`
        );
        
        employeeData.push({
          ...employee,
          attendance,
          working_days: workingDaysData?.working_days || 0
        });
      }
      
      // Export to Excel
      await exportEmployeeReport(employeeData, month, year);
      
      toast.dismiss();
      toast.success('Employee report exported successfully!');
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Failed to export employee report');
    } finally {
      setExporting(false);
    }
  };

  const handleExportDepartment = async () => {
    // Same as export employee but filtered by department
    if (selectedDepartment === 'All') {
      toast.error('Please select a specific department');
      return;
    }
    
    await handleExportEmployee();
  };
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-600 mt-1">Generate and export various reports</p>
      </div>

      {/* Filter Section */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Salesman">Salesman</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Attendance Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Monthly Attendance Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete attendance data for all employees with present/absent statistics
              </p>
              <button 
                onClick={handleExportAttendance}
                disabled={exporting}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Salary Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Salary Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monthly salary calculations with deductions and payable amounts
              </p>
              <button 
                onClick={handleExportSalary}
                disabled={exporting}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Employee Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Employee-wise Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Individual employee attendance history and salary details
              </p>
              <button 
                onClick={handleExportEmployee}
                disabled={exporting}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Department Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Department Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Department-wise attendance and salary analysis
              </p>
              <button 
                onClick={handleExportDepartment}
                disabled={exporting || selectedDepartment === 'All'}
                className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
              {selectedDepartment === 'All' && (
                <p className="text-xs text-gray-500 mt-2">
                  Please select a specific department
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-gray-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Excel Files</h4>
            <p className="text-sm text-gray-600">
              Structured data in .xlsx format for analysis and record keeping
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📱 WhatsApp Messages</h4>
            <p className="text-sm text-gray-600">
              Copy-paste ready text format for sharing via WhatsApp (available on employee detail page)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🖼️ Salary Cards</h4>
            <p className="text-sm text-gray-600">
              Professional PNG images for printing or digital sharing (coming soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
