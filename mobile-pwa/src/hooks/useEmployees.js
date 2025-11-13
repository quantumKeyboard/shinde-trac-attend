import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService, auditService } from '../services/api';
import toast from 'react-hot-toast';

// Query keys for cache management
export const employeeKeys = {
  all: ['employees'],
  list: (filters) => ['employees', 'list', filters],
  detail: (id) => ['employees', 'detail', id],
  byDepartment: (dept) => ['employees', 'department', dept],
};

// Get all employees (cached)
export function useEmployees() {
  return useQuery({
    queryKey: employeeKeys.all,
    queryFn: () => employeeService.getActiveEmployees(),
    select: (data) => data || [],
  });
}

// Get active employees only (cached)
export function useActiveEmployees() {
  return useQuery({
    queryKey: employeeKeys.list({ status: 'Active' }),
    queryFn: () => employeeService.getActiveEmployees(),
    select: (data) => data || [],
  });
}

// Get single employee (cached)
export function useEmployee(id) {
  return useQuery({
    queryKey: employeeKeys.detail(id),
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id, // Only fetch if ID exists
  });
}

// Get employees by department (cached)
export function useEmployeesByDepartment(department) {
  return useQuery({
    queryKey: employeeKeys.byDepartment(department),
    queryFn: () => employeeService.getEmployeesByDepartment(department),
    enabled: !!department && department !== 'All',
  });
}

// Create new employee (invalidates cache)
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeData) => employeeService.createEmployee(employeeData),
    onSuccess: async (newEmployee, variables) => {
      // Invalidate employee lists to refetch
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      
      // Log audit
      await auditService.logAction(
        'create',
        'employees',
        newEmployee.id,
        null,
        newEmployee
      );
      
      toast.success('Employee created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create employee');
      console.error(error);
    },
  });
}

// Update employee (invalidates cache)
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => employeeService.updateEmployee(id, updates),
    onSuccess: async (updatedEmployee, variables) => {
      // Invalidate specific employee and lists
      await queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      
      // Log audit
      await auditService.logAction(
        'update',
        'employees',
        variables.id,
        variables.oldData,
        updatedEmployee
      );
      
      toast.success('Employee updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update employee');
      console.error(error);
    },
  });
}

// Deactivate employee (soft delete - invalidates cache)
export function useDeactivateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => employeeService.updateEmployee(id, { status: 'Inactive' }),
    onSuccess: async (updatedEmployee, variables) => {
      // Invalidate employee lists
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      
      // Log audit
      await auditService.logAction(
        'deactivate',
        'employees',
        variables.id,
        null,
        { status: 'Inactive' }
      );
      
      toast.success('Employee deactivated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to deactivate employee');
      console.error(error);
    },
  });
}
