import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Download, MessageSquare, DollarSign, AlertCircle, RefreshCw, Sun } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useEmployee } from '../hooks/useEmployees';
import { useAttendanceByEmployee } from '../hooks/useAttendance';
import { useWorkingDays } from '../hooks/useWorkingDays';
import { generateWhatsAppMessage } from '../utils/exportSummary';
import { salaryService } from '../services/api';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Date range state
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [salaryCalculation, setSalaryCalculation] = useState(null);
  const [calculatingsalary, setCalculatingsalary] = useState(false);

  // Use React Query hooks for caching
  const { data: employee, isLoading: employeeLoading, refetch: refetchEmployee, isFetching: employeeFetching } = useEmployee(id);
  const { data: attendance = [], isLoading: attendanceLoading, refetch: refetchAttendance, isFetching: attendanceFetching } = useAttendanceByEmployee(id, startDate, endDate);
  
  // Get working days for the employee's department
  const date = parseISO(startDate);
  const month = parseInt(format(date, 'M'));
  const year = parseInt(format(date, 'yyyy'));
  const { data: workingDaysData, refetch: refetchWorkingDays, isFetching: workingDaysFetching } = useWorkingDays(
    month,
    year,
    employee?.department
  );

  const loading = employeeLoading || attendanceLoading;
  const isFetching = employeeFetching || attendanceFetching || workingDaysFetching;
  const workingDays = workingDaysData?.total_working_days || 0;

  // Navigate away if employee not found
  useEffect(() => {
    if (!employeeLoading && !employee) {
      toast.error('Employee not found');
      navigate('/employees');
    }
  }, [employee, employeeLoading, navigate]);

  // Calculate salary whenever date/employee/attendance changes
  useEffect(() => {
    if (!employee || !workingDaysData) {
      setSalaryCalculation(null);
      return;
    }

    const calculateSalary = async () => {
      try {
        setCalculatingsalary(true);
        const calc = await salaryService.calculateMonthlySalary(employee.id, month, year);
        setSalaryCalculation(calc);
      } catch (error) {
        console.error('Error calculating salary:', error);
        setSalaryCalculation(null);
      } finally {
        setCalculatingsalary(false);
      }
    };

    calculateSalary();
  }, [employee?.id, month, year, workingDaysData?.id]);

  // Manual refresh function
  const handleRefresh = async () => {
    await Promise.all([refetchEmployee(), refetchAttendance(), refetchWorkingDays()]);
    toast.success('Data refreshed');
  };

  const handleMonthChange = (increment) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setSelectedMonth(newMonth);
    setStartDate(format(startOfMonth(newMonth), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(newMonth), 'yyyy-MM-dd'));
    setUseCustomRange(false);
  };

  const handleCustomRangeApply = () => {
    setUseCustomRange(true);
    // Date changes will trigger automatic refetch through React Query
  };

  const generateAbsenteeReport = async () => {
    try {
      if (!employee) {
        toast.error('Missing employee data');
        return;
      }

      // Use salary calculation if available, otherwise use final calculation
      const salaryData = salaryCalculation || finalCalculation;

      // Generate WhatsApp message with full salary calculation details
      const message = generateWhatsAppMessage(
        {
          full_name: employee.full_name,
          employee_id: employee.employee_id,
          department: employee.department,
          monthly_salary: employee.monthly_salary
        },
        salaryData,
        attendance
      );

      // Copy to clipboard
      await navigator.clipboard.writeText(message);
      toast.success('Report copied to clipboard! Ready to share on WhatsApp');

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  // Get calendar days for the selected month/range with proper alignment
  const getCalendarDays = () => {
    if (!employee) return [];
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty cells at the start to align first day with correct day of week
    const firstDayOfWeek = days[0]?.getDay() || 0;
    const emptyDays = Array(firstDayOfWeek).fill(null);
    
    return [...emptyDays, ...days];
  };

  const getAttendanceForDate = (date) => {
    return attendance.find(a => isSameDay(parseISO(a.attendance_date), date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Employee Not Found</h2>
          <button onClick={() => navigate('/employees')} className="btn-primary mt-4">
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const absentDates = attendance.filter(a => !a.is_present);
  
  // Use proper calculation if available, otherwise fallback
  const finalCalculation = salaryCalculation || (() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const perDaySalaryCalc = employee?.monthly_salary ? employee.monthly_salary / daysInMonth : 0;
    const absentCount = absentDates.filter(a => !a.is_paid_leave).length;
    const deduction = absentCount * perDaySalaryCalc;
    const finalSalary = employee?.monthly_salary ? employee.monthly_salary - deduction : 0;
    return {
      monthly_salary: employee?.monthly_salary || 0,
      per_day_rate: perDaySalaryCalc,
      deduction_amount: deduction,
      payable_salary: finalSalary,
      overtime_amount: 0,
      days_present: attendance.filter(a => a.is_present).length,
      days_absent_paid: absentDates.filter(a => a.is_paid_leave).length,
      days_absent_unpaid: absentCount,
      sundays_in_month: 0,
      sundays_worked: 0,
      sundays_absent: 0,
      sunday_compensation_days: 0,
      sunday_overtime_days: 0
    };
  })();

  const presentDays = finalCalculation.days_present;
  const paidLeaves = finalCalculation.days_absent_paid;
  const unpaidLeaves = finalCalculation.days_absent_unpaid;
  
  // Get Sunday information from salary calculation
  const totalSundays = finalCalculation.sundays_in_month;
  const sundaysWorked = finalCalculation.sundays_worked;
  const sundaysAbsent = finalCalculation.sundays_absent;
  const sundayCompensation = finalCalculation.sunday_compensation_days;
  const sundayOvertime = finalCalculation.sunday_overtime_days;
  const perDaySalary = finalCalculation.per_day_rate;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{employee.full_name}</h1>
            <p className="text-gray-600 mt-1">
              {employee.employee_id} • {employee.department} • Joined {format(parseISO(employee.date_of_joining), 'dd MMM yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="btn-secondary flex items-center gap-2"
              title="Refresh data from database"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={generateAbsenteeReport}
              className="btn-primary flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Employee Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Monthly Salary</div>
          <div className="text-2xl font-bold text-gray-900">₹{employee.monthly_salary.toLocaleString()}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Contact</div>
          <div className="text-lg font-semibold text-gray-900">{employee.contact_number || 'N/A'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {employee.status}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-600 mb-1">Per Day Salary</div>
          <div className="text-lg font-semibold text-gray-900">₹{perDaySalary.toFixed(2)}</div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Select Date Range</h3>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="monthly"
              checked={!useCustomRange}
              onChange={() => {
                setUseCustomRange(false);
                setStartDate(format(startOfMonth(selectedMonth), 'yyyy-MM-dd'));
                setEndDate(format(endOfMonth(selectedMonth), 'yyyy-MM-dd'));
              }}
            />
            <label htmlFor="monthly" className="text-sm font-medium">Monthly View</label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="custom"
              checked={useCustomRange}
              onChange={() => setUseCustomRange(true)}
            />
            <label htmlFor="custom" className="text-sm font-medium">Custom Range</label>
          </div>
        </div>

        {!useCustomRange ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <div className="flex-1 text-center font-semibold text-lg">
              {format(selectedMonth, 'MMMM yyyy')}
            </div>
            <button
              onClick={() => handleMonthChange(1)}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <button
              onClick={handleCustomRangeApply}
              className="btn-primary mt-6"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4 bg-blue-50">
          <div className="text-sm text-blue-600 mb-1">Working Days</div>
          <div className="text-2xl font-bold text-blue-900">{workingDays}</div>
        </div>
        <div className="card p-4 bg-green-50">
          <div className="text-sm text-green-600 mb-1">Days Present</div>
          <div className="text-2xl font-bold text-green-900">{presentDays}</div>
        </div>
        <div className="card p-4 bg-yellow-50">
          <div className="text-sm text-yellow-600 mb-1">Paid Leaves</div>
          <div className="text-2xl font-bold text-yellow-900">{paidLeaves}</div>
        </div>
        <div className="card p-4 bg-red-50">
          <div className="text-sm text-red-600 mb-1">Unpaid Leaves</div>
          <div className="text-2xl font-bold text-red-900">{unpaidLeaves}</div>
        </div>
        <div className="card p-4 bg-purple-50">
          <div className="text-sm text-purple-600 mb-1">Total Absences</div>
          <div className="text-2xl font-bold text-purple-900">{absentDates.length}</div>
        </div>
      </div>

      {/* Sunday Information (if available) */}
      {totalSundays > 0 && (
        <div className="card p-6 mb-6 bg-orange-50 border-2 border-orange-200">
          <h3 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5" />
            Sunday Work Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-orange-600 mb-1">Total Sundays</div>
              <div className="text-lg font-bold text-orange-900">{totalSundays}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-green-600 mb-1">Sundays Worked</div>
              <div className="text-lg font-bold text-green-900">{sundaysWorked}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Sundays Absent</div>
              <div className="text-lg font-bold text-gray-900">{sundaysAbsent}</div>
              <div className="text-xs text-gray-500 mt-1">(Paid holiday)</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-orange-600 mb-1">Compensation Days</div>
              <div className="text-lg font-bold text-orange-900">{sundayCompensation}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-xs text-purple-600 mb-1">Overtime Days</div>
              <div className="text-lg font-bold text-purple-900">{sundayOvertime}</div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Calculation */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Salary Calculation
        </h3>
        {calculatingsalary ? (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Calculating salary...</span>
          </div>
        ) : salaryCalculation ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Monthly Salary</span>
              <span className="font-semibold">₹{salaryCalculation.monthly_salary.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Per Day Rate (Salary ÷ Days in Month)</span>
              <span className="font-semibold">₹{salaryCalculation.per_day_rate.toFixed(2)}</span>
            </div>
            {salaryCalculation.sundays_in_month > 0 && (
              <div className="bg-orange-50 p-3 rounded-lg my-2 border border-orange-200">
                <p className="text-sm text-orange-900 mb-2">
                  <strong>Sunday Compensation:</strong> {salaryCalculation.sunday_compensation_days} Sundays worked compensate {salaryCalculation.sunday_compensation_days} unpaid absences
                </p>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Unpaid Absences (Before Compensation)</span>
              <span className="font-semibold">{salaryCalculation.days_absent_unpaid} days</span>
            </div>
            {salaryCalculation.sunday_compensation_days > 0 && (
              <div className="flex justify-between items-center py-2 border-b text-orange-600">
                <span>After Sunday Compensation</span>
                <span className="font-semibold">{salaryCalculation.days_absent_unpaid - salaryCalculation.sunday_compensation_days} days</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-b text-red-600">
              <span>Deduction (After compensation)</span>
              <span className="font-semibold">- ₹{salaryCalculation.deduction_amount.toFixed(2)}</span>
            </div>
            {salaryCalculation.sunday_overtime_days > 0 && (
              <div className="flex justify-between items-center py-2 border-b text-purple-600">
                <span>Sunday Overtime ({salaryCalculation.sunday_overtime_days} days)</span>
                <span className="font-semibold">+ ₹{salaryCalculation.overtime_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
              <span className="text-lg font-bold text-green-900">Final Salary Payable</span>
              <span className="text-2xl font-bold text-green-900">₹{salaryCalculation.payable_salary.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">
            <p>Select a month to view salary calculation</p>
          </div>
        )}
      </div>

      {/* Attendance Calendar */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Attendance Calendar
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getCalendarDays().map((day, idx) => {
            // Render empty cell for alignment
            if (!day) {
              return <div key={`empty-${idx}`} className="min-h-[80px]"></div>;
            }
            
            const attendanceRecord = getAttendanceForDate(day);
            const isAbsent = attendanceRecord && !attendanceRecord.is_present;
            const isPresent = attendanceRecord && attendanceRecord.is_present;
            
            return (
              <div
                key={idx}
                className={`
                  min-h-[80px] p-2 rounded-lg border-2 text-center
                  ${isPresent ? 'bg-green-100 border-green-300' : ''}
                  ${isAbsent && attendanceRecord?.is_paid_leave ? 'bg-yellow-100 border-yellow-300' : ''}
                  ${isAbsent && !attendanceRecord?.is_paid_leave ? 'bg-red-100 border-red-300' : ''}
                  ${!attendanceRecord ? 'bg-gray-50 border-gray-200' : ''}
                `}
              >
                <div className="font-semibold text-gray-900">{format(day, 'd')}</div>
                <div className="text-xs text-gray-600 mt-1">{format(day, 'MMM')}</div>
                {isPresent && <div className="text-xs text-green-700 font-semibold mt-1">✓ Present</div>}
                {isAbsent && (
                  <>
                    <div className="text-xs font-semibold mt-1">
                      {attendanceRecord.is_paid_leave ? '💼 Paid' : '✗ Absent'}
                    </div>
                    {attendanceRecord.reason && (
                      <div className="text-xs text-gray-700 mt-1 truncate" title={attendanceRecord.reason}>
                        {attendanceRecord.reason}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Absence History */}
      {absentDates.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold text-gray-900 mb-4">Absence History</h3>
          <div className="space-y-3">
            {absentDates.map((record) => (
              <div key={record.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {format(parseISO(record.attendance_date), 'd')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {format(parseISO(record.attendance_date), 'MMM')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {format(parseISO(record.attendance_date), 'EEEE, dd MMMM yyyy')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.is_paid_leave ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.is_paid_leave ? 'Paid Leave' : 'Unpaid'}
                    </span>
                  </div>
                  {record.absence_reason && (
                    <p className="text-sm text-gray-600">{record.absence_reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
