import { useQuery } from '@tanstack/react-query';
import { employeeService, attendanceService } from '../services/api';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Query keys for dashboard
export const dashboardKeys = {
  all: ['dashboard'],
  stats: (date) => ['dashboard', 'stats', date],
  monthlyAbsentees: (month, year) => ['dashboard', 'absentees', month, year],
};

// Get dashboard stats (cached for 2 minutes - more frequent updates)
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(format(new Date(), 'yyyy-MM-dd')),
    queryFn: async () => {
      // Get all employees
      const allEmployees = await employeeService.getAllEmployees();
      const activeEmployees = allEmployees.filter(e => e.status === 'Active');

      // Get today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayAttendance = await attendanceService.getAttendanceByDate(today);
      
      const todayPresent = todayAttendance.filter(a => a.is_present).length;
      const todayAbsent = todayAttendance.filter(a => !a.is_present).length;

      // Get current month's attendance for absentees
      const currentDate = new Date();
      const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      const monthlyAttendance = await attendanceService.getAttendanceByDateRange(monthStart, monthEnd);
      
      // Calculate monthly absentees with paid/unpaid split
      const absenteeMap = {};
      monthlyAttendance.forEach(record => {
        if (!record.is_present) {
          if (!absenteeMap[record.employee_id]) {
            const employee = activeEmployees.find(e => e.id === record.employee_id);
            if (employee) {
              absenteeMap[record.employee_id] = {
                employee,
                totalAbsences: 0,
                paidLeaves: 0,
                unpaidLeaves: 0,
                dates: []
              };
            }
          }
          if (absenteeMap[record.employee_id]) {
            absenteeMap[record.employee_id].totalAbsences++;
            if (record.is_paid_leave) {
              absenteeMap[record.employee_id].paidLeaves++;
            } else {
              absenteeMap[record.employee_id].unpaidLeaves++;
            }
            absenteeMap[record.employee_id].dates.push(record.attendance_date);
          }
        }
      });

      const monthlyAbsentees = Object.values(absenteeMap)
        .sort((a, b) => b.totalAbsences - a.totalAbsences)
        .slice(0, 10); // Top 10 absentees

      return {
        totalEmployees: allEmployees.length,
        activeEmployees: activeEmployees.length,
        todayPresent,
        todayAbsent,
        monthlyAbsentees,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard should update frequently
    refetchOnWindowFocus: true, // Refetch when user returns to app
  });
}
