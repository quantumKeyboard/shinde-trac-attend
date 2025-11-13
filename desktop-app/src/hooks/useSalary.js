import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salaryService } from '../services/api';
import toast from 'react-hot-toast';

// Query keys for salary calculations
export const salaryKeys = {
  all: ['salary'],
  calculations: (month, year) => ['salary', 'calculations', month, year],
  single: (employeeId, month, year) => ['salary', 'single', employeeId, month, year],
};

// Get salary calculation for a specific employee
export function useSalaryCalculation(employeeId, month, year) {
  return useQuery({
    queryKey: salaryKeys.single(employeeId, month, year),
    queryFn: () => salaryService.getSalaryCalculation(employeeId, month, year),
    enabled: !!employeeId && !!month && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get all salary calculations for a month
export function useMonthlySalaryCalculations(month, year) {
  return useQuery({
    queryKey: salaryKeys.calculations(month, year),
    queryFn: () => salaryService.getMonthlySalaryCalculations(month, year),
    enabled: !!month && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Save salary calculation mutation
export function useSaveSalaryCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (calculationData) => salaryService.saveSalaryCalculation(calculationData),
    onSuccess: async (data, variables) => {
      // Invalidate and refetch all related queries to refresh the data everywhere
      
      // 1. Invalidate salary calculations
      await queryClient.invalidateQueries({ 
        queryKey: salaryKeys.all,
        refetchType: 'active' // Refetch active queries immediately
      });

      // 2. Invalidate specific employee's salary calculation
      await queryClient.invalidateQueries({ 
        queryKey: salaryKeys.single(variables.employee_id, variables.month, variables.year),
        refetchType: 'active'
      });

      // 3. Invalidate monthly calculations
      await queryClient.invalidateQueries({ 
        queryKey: salaryKeys.calculations(variables.month, variables.year),
        refetchType: 'active'
      });

      // 4. Invalidate dashboard stats (as it might show salary-related info)
      await queryClient.invalidateQueries({ 
        queryKey: ['dashboard'],
        refetchType: 'active'
      });

      // 5. Invalidate employee data (in case it displays latest salary)
      await queryClient.invalidateQueries({ 
        queryKey: ['employees'],
        refetchType: 'active'
      });

      // 6. Invalidate attendance data (related to salary calculations)
      await queryClient.invalidateQueries({ 
        queryKey: ['attendance'],
        refetchType: 'active'
      });

      // Force refetch all active queries to ensure fresh data
      await queryClient.refetchQueries({ 
        type: 'active',
        stale: true 
      });

      toast.success('Salary calculation saved successfully');
    },
    onError: (error) => {
      console.error('Error saving salary calculation:', error);
      toast.error('Failed to save salary calculation');
    },
  });
}

// Finalize salary calculation mutation
export function useFinalizeSalaryCalculation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => salaryService.finalizeSalaryCalculation(id),
    onSuccess: () => {
      // Invalidate all salary-related queries
      queryClient.invalidateQueries({ 
        queryKey: salaryKeys.all 
      });
      
      toast.success('Salary calculation finalized');
    },
    onError: (error) => {
      console.error('Error finalizing salary:', error);
      toast.error('Failed to finalize salary calculation');
    },
  });
}
