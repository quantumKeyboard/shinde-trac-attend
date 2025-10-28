import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Check, X, Save } from 'lucide-react';
import { employeeService, attendanceService, auditService } from '../services/api';
import { useAuthStore } from '../store';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function Attendance() {
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
      const employeesData = await employeeService.getActiveEmployees();
      setEmployees(employeesData);

      const attendanceData = await attendanceService.getAttendanceByDate(selectedDate);
      
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

  const validateAttendance = () => {
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

    setSaving(true);
    try {
      const attendanceRecords = Object.values(attendance).map(record => ({
        employee_id: record.employee_id,
        attendance_date: selectedDate,
        is_present: record.is_present,
        is_paid_leave: record.is_paid_leave,
        absence_reason: record.absence_reason || null
      }));

      await attendanceService.markBulkAttendance(attendanceRecords);
      
      await auditService.logAction(
        'mark_attendance',
        'attendance',
        null,
        null,
        { count: attendanceRecords.length, date: selectedDate }
      );

      toast.success('Attendance saved successfully!');
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-1">Record employee attendance for the day</p>
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
              Mark All Present
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="space-y-6">
        {DEPARTMENTS.map(dept => {
          const deptEmployees = groupedEmployees[dept];
          if (deptEmployees.length === 0) return null;

          return (
            <div key={dept} className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{dept}</h3>
              <div className="space-y-3">
                {deptEmployees.map(employee => {
                  const record = attendance[employee.id];
                  if (!record) return null;

                  return (
                    <div
                      key={employee.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        record.is_present
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {employee.full_name}
                          </h4>
                          <p className="text-sm text-gray-600">{employee.employee_id}</p>
                        </div>

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
                      </div>

                      {!record.is_present && (
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
    </div>
  );
}
