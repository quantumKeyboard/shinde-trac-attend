import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workingDaysService, auditService } from '../services/api';
import toast from 'react-hot-toast';

// Query keys for working days cache
export const workingDaysKeys = {
  all: ['workingDays'],
  byMonthYear: (month, year) => ['workingDays', 'month', month, year],
  byDepartment: (month, year, department) => ['workingDays', month, year, department],
};

// Get working days by month and year (cached)
export function useWorkingDays(month, year, department) {
  return useQuery({
    queryKey: workingDaysKeys.byDepartment(month, year, department),
    queryFn: () => workingDaysService.getWorkingDays(month, year, department),
    enabled: !!month && !!year && !!department,
    staleTime: 15 * 60 * 1000, // Working days don't change often, cache for 15 mins
  });
}

// Get all working days for a month (all departments)
export function useAllWorkingDays(month, year) {
  return useQuery({
    queryKey: workingDaysKeys.byMonthYear(month, year),
    queryFn: async () => {
      // Fetch working days for all departments
      const departments = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];
      const promises = departments.map(dept => 
        workingDaysService.getWorkingDays(month, year, dept)
      );
      const results = await Promise.all(promises);
      return results.reduce((acc, result, index) => {
        acc[departments[index]] = result;
        return acc;
      }, {});
    },
    enabled: !!month && !!year,
    staleTime: 15 * 60 * 1000,
  });
}

// Set working days (invalidates cache)
export function useSetWorkingDays() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workingDaysData) => workingDaysService.setWorkingDays(workingDaysData),
    onSuccess: async (data, variables) => {
      // Invalidate working days cache for this month/year
      await queryClient.invalidateQueries({ 
        queryKey: workingDaysKeys.byMonthYear(variables.month, variables.year) 
      });
      await queryClient.invalidateQueries({ queryKey: workingDaysKeys.all });
      
      // Log audit
      await auditService.logAction(
        variables.id ? 'update' : 'create',
        'working_days',
        variables.id,
        null,
        variables
      );
      
      toast.success('Working days set successfully!');
    },
    onError: (error) => {
      toast.error('Failed to set working days');
      console.error(error);
    },
  });
}
