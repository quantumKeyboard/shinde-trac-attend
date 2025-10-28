import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { employeeService, attendanceService } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    todayPresent: 0,
    todayAbsent: 0,
    monthlyAbsentees: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get all employees
      const allEmployees = await employeeService.getAllEmployees();
      const activeEmployees = allEmployees.filter(e => e.status === 'Active');

      // Get today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAttendance = await attendanceService.getAttendanceByDate(today);
      
      const todayPresent = todayAttendance.filter(a => a.is_present).length;
      const todayAbsent = todayAttendance.filter(a => !a.is_present).length;

      // Get monthly absentees
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const monthlyAbsences = await attendanceService.getAbsenteesSummary(month, year);

      // Group by employee
      const absenteeMap = {};
      monthlyAbsences.forEach(record => {
        const empId = record.employee_id;
        if (!absenteeMap[empId]) {
          absenteeMap[empId] = {
            employee: record.employees,
            totalAbsences: 0,
            paidLeaves: 0,
            unpaidLeaves: 0,
            absences: []
          };
        }
        absenteeMap[empId].totalAbsences++;
        if (record.is_paid_leave) {
          absenteeMap[empId].paidLeaves++;
        } else {
          absenteeMap[empId].unpaidLeaves++;
        }
        absenteeMap[empId].absences.push(record);
      });

      const absenteesList = Object.values(absenteeMap).sort(
        (a, b) => b.totalAbsences - a.totalAbsences
      );

      setStats({
        totalEmployees: allEmployees.length,
        activeEmployees: activeEmployees.length,
        todayPresent,
        todayAbsent,
        monthlyAbsentees: absenteesList.slice(0, 10), // Top 10
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentMonth = format(new Date(), 'MMMM yyyy');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of attendance and employee statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Employees */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeEmployees} active
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-full">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Today Present */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{stats.todayPresent}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.activeEmployees > 0 ? Math.round((stats.todayPresent / stats.activeEmployees) * 100) : 0}% attendance
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-full">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Today Absent */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Absent Today</p>
              <p className="text-3xl font-bold text-red-600">{stats.todayAbsent}</p>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(), 'dd MMM yyyy')}
              </p>
            </div>
            <div className="bg-red-100 p-4 rounded-full">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">This Month</p>
              <p className="text-3xl font-bold text-primary-600">{currentMonth.split(' ')[0]}</p>
              <p className="text-sm text-gray-600 mt-1">
                View detailed reports
              </p>
            </div>
            <div className="bg-primary-100 p-4 rounded-full">
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Absentees Panel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              <AlertCircle className="inline w-5 h-5 mr-2 text-orange-500" />
              Top Absentees - {currentMonth}
            </h2>
          </div>

          {stats.monthlyAbsentees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No absences recorded this month</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.monthlyAbsentees.map((absentee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {absentee.employee?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {absentee.employee?.employee_id} • {absentee.employee?.department}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{absentee.totalAbsences}</p>
                    <p className="text-xs text-gray-600">
                      <span className="text-red-600">{absentee.unpaidLeaves} unpaid</span>
                      {' • '}
                      <span className="text-yellow-600">{absentee.paidLeaves} paid</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => window.location.href = '/attendance'}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
            >
              <UserCheck className="w-8 h-8 text-blue-600 mb-3" />
              <p className="font-semibold text-gray-900">Mark Attendance</p>
              <p className="text-sm text-gray-600 mt-1">Daily attendance marking</p>
            </button>

            <button
              onClick={() => window.location.href = '/employees'}
              className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left"
            >
              <Users className="w-8 h-8 text-green-600 mb-3" />
              <p className="font-semibold text-gray-900">Manage Employees</p>
              <p className="text-sm text-gray-600 mt-1">Add or edit employees</p>
            </button>

            <button
              onClick={() => window.location.href = '/salary'}
              className="p-6 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left"
            >
              <DollarSign className="w-8 h-8 text-purple-600 mb-3" />
              <p className="font-semibold text-gray-900">Calculate Salary</p>
              <p className="text-sm text-gray-600 mt-1">Monthly salary processing</p>
            </button>

            <button
              onClick={() => window.location.href = '/reports'}
              className="p-6 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
            >
              <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
              <p className="font-semibold text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600 mt-1">Export and analyze data</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
