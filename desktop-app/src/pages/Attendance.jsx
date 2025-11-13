import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, X, Save, RefreshCw, MessageSquare, Send } from 'lucide-react';
import { useActiveEmployees } from '../hooks/useEmployees';
import { useAttendanceByDate, useMarkBulkAttendance } from '../hooks/useAttendance';
import { useAuthStore } from '../store';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function Attendance() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [attendance, setAttendance] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [customMessage, setCustomMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const { user } = useAuthStore();

  // Use React Query hooks for caching
  const { data: employees = [], isLoading: employeesLoading, refetch: refetchEmployees, isFetching: employeesFetching } = useActiveEmployees();
  const { data: attendanceData = [], isLoading: attendanceLoading, refetch: refetchAttendance, isFetching: attendanceFetching } = useAttendanceByDate(selectedDate);
  const markBulkAttendance = useMarkBulkAttendance();

  const loading = employeesLoading || attendanceLoading;
  const isFetching = employeesFetching || attendanceFetching;

  // Initialize attendance state when data changes
  useEffect(() => {
    if (employees.length > 0) {
      const date = new Date(selectedDate);
      const isSunday = date.getDay() === 0;
      
      const attendanceMap = {};
      employees.forEach(emp => {
        const existingAttendance = attendanceData.find(a => a.employee_id === emp.id);
        
        // On Sundays: Only include employees who have existing attendance records (worked)
        // On Regular days: Include all employees with default present status
        if (existingAttendance) {
          attendanceMap[emp.id] = existingAttendance;
        } else if (!isSunday) {
          // Only auto-initialize for non-Sunday days
          attendanceMap[emp.id] = {
            employee_id: emp.id,
            attendance_date: selectedDate,
            is_present: true,
            is_paid_leave: false,
            absence_reason: ''
          };
        }
      });
      setAttendance(attendanceMap);
    }
  }, [employees, attendanceData, selectedDate]);

  // Manual refresh function
  const handleRefresh = async () => {
    await Promise.all([refetchEmployees(), refetchAttendance()]);
    toast.success('Data refreshed');
  };

  const handleAttendanceToggle = (employeeId) => {
    setAttendance(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        is_present: !prev[employeeId].is_present,
        is_paid_leave: false,
        absence_reason: ''
      }
    }));
  };

  const handleReasonChange = (employeeId, reason) => {
    setAttendance(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        absence_reason: reason
      }
    }));
  };

  const handlePaidLeaveToggle = (employeeId) => {
    setAttendance(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        is_paid_leave: !prev[employeeId].is_paid_leave
      }
    }));
  };

  const validateAttendance = () => {
    // Check if selected date is Sunday
    const date = new Date(selectedDate);
    const isSunday = date.getDay() === 0;
    
    // On Sundays, no validation needed - only save who worked
    if (isSunday) return true;
    
    // On regular days, validate absence reasons
    for (const empId in attendance) {
      const record = attendance[empId];
      if (!record.is_present && !record.absence_reason) {
        const employee = employees.find(e => e.id === empId);
        toast.error(`Please provide absence reason for ${employee?.full_name}`);
        return false;
      }
    }
    return true;
  };

  const handleSaveAttendance = async () => {
    if (!validateAttendance()) return;

    // Check if selected date is Sunday
    const date = new Date(selectedDate);
    const isSunday = date.getDay() === 0;
    
    // On Sundays: Only save records for employees who are marked (present)
    // On Regular days: Save all attendance records
    const attendanceRecords = Object.values(attendance)
      .filter(record => !isSunday || record.is_present) // On Sunday, only save if present
      .map(record => ({
        employee_id: record.employee_id,
        attendance_date: selectedDate,
        is_present: record.is_present,
        is_paid_leave: record.is_paid_leave,
        is_sunday_work: isSunday && record.is_present, // Auto-mark Sunday work
        absence_reason: record.absence_reason || null,
        marked_by: user?.id,
        updated_by: user?.id
      }));

    await markBulkAttendance.mutateAsync(attendanceRecords);
  };

  const handleMarkAllPresent = () => {
    const date = new Date(selectedDate);
    const isSunday = date.getDay() === 0;
    
    if (isSunday) {
      // On Sunday: Mark ALL employees as working (add all to attendance)
      const updatedAttendance = {};
      employees.forEach(emp => {
        updatedAttendance[emp.id] = {
          employee_id: emp.id,
          attendance_date: selectedDate,
          is_present: true,
          is_paid_leave: false,
          absence_reason: ''
        };
      });
      setAttendance(updatedAttendance);
      toast.success('All employees marked as working on Sunday');
    } else {
      // Regular day: Mark all existing attendance as present
      const updatedAttendance = {};
      Object.keys(attendance).forEach(empId => {
        updatedAttendance[empId] = {
          ...attendance[empId],
          is_present: true,
          is_paid_leave: false,
          absence_reason: ''
        };
      });
      setAttendance(updatedAttendance);
      toast.success('All marked present');
    }
  };

  const handleShareMessage = async () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message to share');
      return;
    }

    // Check if Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          text: customMessage
        });
        toast.success('Message shared successfully');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Failed to share message');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(customMessage);
        toast.success('Message copied to clipboard! You can now paste it in WhatsApp or other apps');
      } catch (error) {
        toast.error('Failed to copy message');
        console.error('Clipboard error:', error);
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    selectedDepartment === 'All' || emp.department === selectedDepartment
  );

  const groupedEmployees = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = filteredEmployees.filter(emp => emp.department === dept);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-1">Record employee attendance for the day</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="btn-secondary flex items-center gap-2"
          title="Refresh data from database"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
            {new Date(selectedDate).getDay() === 0 && (
              <p className="text-sm text-orange-600 mt-1 font-medium">
                🌅 Sunday - Compensation/Overtime Day
              </p>
            )}
          </div>
          
          <div>
            <label className="label">Department Filter</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleMarkAllPresent}
              className="btn-secondary w-full"
            >
              {new Date(selectedDate).getDay() === 0 
                ? 'Mark All as Working' 
                : 'Mark All Present'}
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveAttendance}
              disabled={markBulkAttendance.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {markBulkAttendance.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="space-y-6">
        {DEPARTMENTS.map(dept => {
          const deptEmployees = groupedEmployees[dept];
          if (deptEmployees.length === 0) return null;

          const isSunday = new Date(selectedDate).getDay() === 0;

          return (
            <div key={dept} className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{dept}</h3>
              <div className="space-y-3">
                {deptEmployees.map(employee => {
                  const record = attendance[employee.id];
                  
                  // On Sunday: Show all employees with option to mark as working
                  // On Regular day: Show only employees with attendance records
                  if (!isSunday && !record) return null;

                  const isWorking = record?.is_present || false;
                  const hasRecord = !!record;

                  return (
                    <div
                      key={employee.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isWorking
                          ? 'border-green-300 bg-green-50'
                          : hasRecord 
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {employee.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">{employee.employee_id}</p>
                          {isSunday && !hasRecord && (
                            <p className="text-xs text-orange-600 mt-1">No attendance (Sunday off)</p>
                          )}
                        </div>

                        {isSunday ? (
                          // Sunday: Only show "Mark as Working" button
                          <button
                            onClick={() => {
                              if (!hasRecord) {
                                // Add employee to attendance with present status
                                setAttendance(prev => ({
                                  ...prev,
                                  [employee.id]: {
                                    employee_id: employee.id,
                                    attendance_date: selectedDate,
                                    is_present: true,
                                    is_paid_leave: false,
                                    absence_reason: ''
                                  }
                                }));
                              } else {
                                // Remove employee from attendance (they're not working)
                                setAttendance(prev => {
                                  const newAttendance = { ...prev };
                                  delete newAttendance[employee.id];
                                  return newAttendance;
                                });
                              }
                            }}
                            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                              isWorking
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                            {isWorking ? 'Working ✓' : 'Mark as Working'}
                          </button>
                        ) : (
                          // Regular day: Show Present/Absent buttons
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAttendanceToggle(employee.id)}
                              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                                record.is_present
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <Check className="w-5 h-5" />
                              Present
                            </button>
                            <button
                              onClick={() => handleAttendanceToggle(employee.id)}
                              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                                !record.is_present
                                  ? 'bg-red-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              <X className="w-5 h-5" />
                              Absent
                            </button>
                          </div>
                        )}
                      </div>

                      {!isSunday && !record.is_present && (
                        <div className="mt-4 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Absence Reason *
                            </label>
                            <input
                              type="text"
                              value={record.absence_reason}
                              onChange={(e) => handleReasonChange(employee.id, e.target.value)}
                              placeholder="Enter reason for absence"
                              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`paid-${employee.id}`}
                              checked={record.is_paid_leave}
                              onChange={() => handlePaidLeaveToggle(employee.id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <label htmlFor={`paid-${employee.id}`} className="text-sm font-medium text-gray-700">
                              Paid Leave
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Message Share Section */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Share Custom Message
          </h3>
          <button
            onClick={() => setShowMessageBox(!showMessageBox)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showMessageBox ? 'Hide' : 'Show'}
          </button>
        </div>

        {showMessageBox && (
          <div>
            <label className="label mb-2">Type your message</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your custom message here..."
              rows={4}
              className="input-field resize-none mb-3"
            />
            <p className="text-sm text-gray-600 mb-3">
              Click send to share via WhatsApp or other messaging apps. On desktop, the message will be copied to clipboard.
            </p>
            <button
              onClick={handleShareMessage}
              disabled={!customMessage.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
