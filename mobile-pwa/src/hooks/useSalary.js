import { useQuery, useMutation } from '@tanstack/react-query';
import { salaryService } from '../services/api';
import { queryClient } from '../lib/queryClient';

export const useSalaryCalculation = (employeeId, month, year) => {
  return useQuery({
    queryKey: ['salary', employeeId, month, year],
    queryFn: async () => {
      // First try to get saved calculation
      const saved = await salaryService.getSalaryCalculation(employeeId, month, year);
      if (saved) return saved;
      
      // If not saved, calculate fresh
      return await salaryService.calculateMonthlySalary(employeeId, month, year);
    },
    enabled: !!employeeId && !!month && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSaveSalaryCalculation = () => {
  return useMutation({
    mutationFn: async (calculationData) => {
      return await salaryService.saveSalaryCalculation(calculationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
      queryClient.invalidateQueries({ queryKey: ['salary_calculations'] });
    },
  });
};

export const useMonthlySalaryCalculations = (month, year) => {
  return useQuery({
    queryKey: ['salary_calculations', month, year],
    queryFn: async () => {
      return await salaryService.getMonthlySalaryCalculations(month, year);
    },
    enabled: !!month && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCalculateEmployeeSalaries = () => {
  return useMutation({
    mutationFn: async ({ employeeIds, month, year }) => {
      const results = [];
      
      for (const employeeId of employeeIds) {
        try {
          const calculation = await salaryService.calculateMonthlySalary(
            employeeId,
            month,
            year
          );
          results.push({
            success: true,
            employeeId,
            data: calculation
          });
        } catch (error) {
          results.push({
            success: false,
            employeeId,
            error: error.message
          });
        }
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });
};

export const useBulkSaveSalaryCalculations = () => {
  return useMutation({
    mutationFn: async (calculationDataArray) => {
      const results = [];
      
      for (const calculationData of calculationDataArray) {
        try {
          const saved = await salaryService.saveSalaryCalculation(calculationData);
          results.push({
            success: true,
            data: saved
          });
        } catch (error) {
          results.push({
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary'] });
      queryClient.invalidateQueries({ queryKey: ['salary_calculations'] });
    },
  });
};
