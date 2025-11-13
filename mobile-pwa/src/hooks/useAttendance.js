import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, auditService } from '../services/api';
import toast from 'react-hot-toast';

// Query keys for attendance cache
export const attendanceKeys = {
  all: ['attendance'],
  byDate: (date) => ['attendance', 'date', date],
  byEmployee: (employeeId, dateRange) => ['attendance', 'employee', employeeId, dateRange],
  byDateRange: (startDate, endDate) => ['attendance', 'range', startDate, endDate],
};

// Get attendance by date (cached)
export function useAttendanceByDate(date) {
  return useQuery({
    queryKey: attendanceKeys.byDate(date),
    queryFn: () => attendanceService.getAttendanceByDate(date),
    enabled: !!date,
    select: (data) => data || [],
  });
}

// Get attendance by employee (cached)
export function useAttendanceByEmployee(employeeId, startDate, endDate) {
  return useQuery({
    queryKey: attendanceKeys.byEmployee(employeeId, { startDate, endDate }),
    queryFn: () => attendanceService.getEmployeeAttendance(employeeId, startDate, endDate),
    enabled: !!employeeId && !!startDate && !!endDate,
    select: (data) => data || [],
  });
}

// Get attendance by date range (cached)
export function useAttendanceByDateRange(startDate, endDate) {
  return useQuery({
    queryKey: attendanceKeys.byDateRange(startDate, endDate),
    queryFn: () => attendanceService.getByEmployeeAndDateRange(null, startDate, endDate),
    enabled: !!startDate && !!endDate,
    select: (data) => data || [],
  });
}

// Mark bulk attendance (invalidates cache)
export function useMarkBulkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceRecords) => attendanceService.markBulkAttendance(attendanceRecords),
    onSuccess: async (data, variables) => {
      // Get the date from the first record
      const date = variables[0]?.attendance_date;
      
      // Invalidate specific date and all attendance queries
      if (date) {
        await queryClient.invalidateQueries({ queryKey: attendanceKeys.byDate(date) });
      }
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      
      // Log audit
      await auditService.logAction(
        'mark_attendance',
        'attendance',
        null,
        null,
        { count: variables.length, date }
      );
      
      toast.success('Attendance saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save attendance');
      console.error(error);
    },
  });
}

// Update single attendance (invalidates cache)
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => attendanceService.updateAttendance(id, updates),
    onSuccess: async (updatedRecord, variables) => {
      // Invalidate attendance cache
      await queryClient.invalidateQueries({ queryKey: attendanceKeys.all });
      
      // Log audit
      await auditService.logAction(
        'update',
        'attendance',
        variables.id,
        variables.oldData,
        updatedRecord
      );
      
      toast.success('Attendance updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update attendance');
      console.error(error);
    },
  });
}
