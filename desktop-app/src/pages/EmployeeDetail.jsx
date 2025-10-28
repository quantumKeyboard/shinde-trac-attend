import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Download, MessageSquare, DollarSign, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { employeeService, attendanceService, workingDaysService, salaryService } from '../services/api';
import { generateWhatsAppMessage } from '../utils/exportSummary';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [workingDays, setWorkingDays] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Date range state
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [useCustomRange, setUseCustomRange] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [id, startDate, endDate]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);
      
      // Load employee details
      const empData = await employeeService.getById(id);
      if (!empData) {
        toast.error('Employee not found');
        navigate('/employees');
        return;
      }
      setEmployee(empData);

      // Load attendance for date range
      const attendanceData = await attendanceService.getByEmployeeAndDateRange(
        id,
        startDate,
        endDate
      );
      setAttendance(attendanceData || []);

      // Load working days for the employee's department
      const date = parseISO(startDate);
      const month = parseInt(format(date, 'M'));
      const year = parseInt(format(date, 'yyyy'));
      const workingDaysData = await workingDaysService.getWorkingDays(
        month,
        year,
        empData.department
      );
      setWorkingDays(workingDaysData?.total_working_days || 0);

    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error(`Failed to load employee details: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
    loadEmployeeData();
  };

  const generateAbsenteeReport = async () => {
    try {
      if (!employee || !workingDays) {
        toast.error('Missing required data for report generation');
        return;
      }

      const totalDays = attendance.length;
      const presentDays = attendance.filter(a => a.status === 'Present').length;
      const absentDays = attendance.filter(a => a.status === 'Absent').length;
      const paidLeaveDays = attendance.filter(a => a.status === 'Absent' && a.is_paid_leave).length;
      const unpaidLeaveDays = absentDays - paidLeaveDays;

      // Calculate salary
      const perDaySalary = employee.monthly_salary / workingDays;
      const deduction = unpaidLeaveDays * perDaySalary;
      const finalSalary = employee.monthly_salary - deduction;

      // Generate WhatsApp message
      const message = generateWhatsAppMessage({
        employee: {
          full_name: employee.full_name,
          employee_id: employee.employee_id,
          department: employee.department,
          monthly_salary: employee.monthly_salary
        },
        attendance: {
          total_working_days: workingDays,
          days_present: presentDays,
          days_absent: absentDays,
          paid_leaves: paidLeaveDays,
          unpaid_leaves: unpaidLeaveDays
        },
        salary: {
          per_day_salary: perDaySalary,
          deduction: deduction,
          final_salary: finalSalary
        },
        period: {
          start: startDate,
          end: endDate
        }
      });

      // Copy to clipboard
      await navigator.clipboard.writeText(message);
      toast.success('Report copied to clipboard! Ready to share on WhatsApp');

    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  // Get calendar days for the selected month/range
  const getCalendarDays = () => {
    if (!employee) return [];
    
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    return eachDayOfInterval({ start, end });
  };

  const getAttendanceForDate = (date) => {
    return attendance.find(a => isSameDay(parseISO(a.date), date));
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

  const absentDates = attendance.filter(a => a.status === 'Absent');
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const paidLeaves = absentDates.filter(a => a.is_paid_leave).length;
  const unpaidLeaves = absentDates.length - paidLeaves;
  
  const perDaySalary = workingDays > 0 ? employee.monthly_salary / workingDays : 0;
  const deduction = unpaidLeaves * perDaySalary;
  const finalSalary = employee.monthly_salary - deduction;

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

      {/* Salary Calculation */}
      <div className="card p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Salary Calculation
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Monthly Salary</span>
            <span className="font-semibold">₹{employee.monthly_salary.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Per Day Salary ({employee.monthly_salary} ÷ {workingDays})</span>
            <span className="font-semibold">₹{perDaySalary.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Unpaid Leaves</span>
            <span className="font-semibold">{unpaidLeaves} days</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b text-red-600">
            <span>Deduction ({unpaidLeaves} × ₹{perDaySalary.toFixed(2)})</span>
            <span className="font-semibold">- ₹{deduction.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
            <span className="text-lg font-bold text-green-900">Final Salary Payable</span>
            <span className="text-2xl font-bold text-green-900">₹{finalSalary.toFixed(2)}</span>
          </div>
        </div>
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
            const attendanceRecord = getAttendanceForDate(day);
            const isAbsent = attendanceRecord?.status === 'Absent';
            const isPresent = attendanceRecord?.status === 'Present';
            
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
                        {format(parseISO(record.date), 'd')}
                      </div>
                      <div className="text-xs text-gray-600">
                        {format(parseISO(record.date), 'MMM')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {format(parseISO(record.date), 'EEEE, dd MMMM yyyy')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      record.is_paid_leave ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {record.is_paid_leave ? 'Paid Leave' : 'Unpaid'}
                    </span>
                  </div>
                  {record.reason && (
                    <p className="text-sm text-gray-600">{record.reason}</p>
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
