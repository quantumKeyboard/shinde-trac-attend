import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, X, Calendar as CalendarIcon, Save, Users as UsersIcon } from 'lucide-react';
import { employeeService, attendanceService, auditService } from '../services/api';
import { useAuthStore } from '../store';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function AttendanceMark() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const { user } = useAuthStore();

  useEffect(() => {
    loadEmployeesAndAttendance();
  }, [selectedDate]);

  const loadEmployeesAndAttendance = async () => {
    setLoading(true);
    try {
      // Load all active employees
      const employeesData = await employeeService.getActiveEmployees();
      setEmployees(employeesData);

      // Load existing attendance for selected date
      const attendanceData = await attendanceService.getAttendanceByDate(selectedDate);
      
      // Create attendance map
      const attendanceMap = {};
      employeesData.forEach(emp => {
        const existingAttendance = attendanceData.find(a => a.employee_id === emp.id);
        attendanceMap[emp.id] = existingAttendance || {
          employee_id: emp.id,
          attendance_date: selectedDate,
          is_present: true,
          is_paid_leave: false,
          absence_reason: ''
        };
      });

      setAttendance(attendanceMap);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
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

  const handleMarkAllPresent = () => {
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
  };

  const handleMarkDepartmentPresent = () => {
    if (selectedDepartment === 'All') {
      toast.error('Please select a specific department');
      return;
    }

    const updatedAttendance = { ...attendance };
    employees
      .filter(emp => emp.department === selectedDepartment)
      .forEach(emp => {
        updatedAttendance[emp.id] = {
          ...updatedAttendance[emp.id],
          is_present: true,
          is_paid_leave: false,
          absence_reason: ''
        };
      });
    
    setAttendance(updatedAttendance);
    toast.success(`${selectedDepartment} marked present`);
  };

  const validateAttendance = () => {
    for (const empId in attendance) {
      const record = attendance[empId];
      if (!record.is_present && !record.absence_reason?.trim()) {
        const emp = employees.find(e => e.id === empId);
        toast.error(`Please provide absence reason for ${emp?.full_name}`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    // Validate future date
    if (new Date(selectedDate) > new Date()) {
      toast.error('Cannot mark attendance for future dates');
      return;
    }

    // Validate absence reasons
    if (!validateAttendance()) {
      return;
    }

    setSaving(true);
    try {
      // Prepare attendance records
      const attendanceRecords = Object.values(attendance).map(record => ({
        ...record,
        marked_by: user?.id,
        updated_by: user?.id
      }));

      // Save to database
      await attendanceService.markBulkAttendance(attendanceRecords);

      // Log action
      await auditService.logAction(
        'MARK_ATTENDANCE',
        'attendance',
        null,
        null,
        { date: selectedDate, count: attendanceRecords.length }
      );

      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = selectedDepartment === 'All'
    ? employees
    : employees.filter(emp => emp.department === selectedDepartment);

  const groupedEmployees = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = filteredEmployees.filter(emp => emp.department === dept);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CalendarIcon className="inline w-4 h-4 mr-2" />
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Department Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UsersIcon className="inline w-4 h-4 mr-2" />
          Department Filter
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="All">All Departments</option>
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleMarkAllPresent}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors touch-target"
        >
          Mark All Present
        </button>
        <button
          onClick={handleMarkDepartmentPresent}
          disabled={selectedDepartment === 'All'}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors touch-target disabled:opacity-50"
        >
          Mark Dept Present
        </button>
      </div>

      {/* Employee List */}
      <div className="space-y-4">
        {DEPARTMENTS.map(dept => {
          const deptEmployees = groupedEmployees[dept];
          if (deptEmployees.length === 0) return null;

          return (
            <div key={dept}>
              <h3 className="text-lg font-bold text-gray-800 mb-2 px-2">
                {dept} ({deptEmployees.length})
              </h3>
              <div className="space-y-2">
                {deptEmployees.map(employee => {
                  const record = attendance[employee.id] || {};
                  const isPresent = record.is_present;

                  return (
                    <div
                      key={employee.id}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {employee.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">{employee.employee_id}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAttendanceToggle(employee.id)}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all touch-target ${
                              isPresent
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Check className="inline w-5 h-5 mr-1" />
                            Present
                          </button>
                          <button
                            onClick={() => handleAttendanceToggle(employee.id)}
                            className={`px-6 py-2 rounded-lg font-semibold transition-all touch-target ${
                              !isPresent
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <X className="inline w-5 h-5 mr-1" />
                            Absent
                          </button>
                        </div>
                      </div>

                      {/* Absence Details */}
                      {!isPresent && (
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reason for Absence *
                            </label>
                            <textarea
                              value={record.absence_reason || ''}
                              onChange={(e) => handleReasonChange(employee.id, e.target.value)}
                              placeholder="Enter reason..."
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              required
                            />
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`paid-${employee.id}`}
                              checked={record.is_paid_leave || false}
                              onChange={() => handlePaidLeaveToggle(employee.id)}
                              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label
                              htmlFor={`paid-${employee.id}`}
                              className="ml-2 text-sm font-medium text-gray-700"
                            >
                              Paid Leave (No salary deduction)
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

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
