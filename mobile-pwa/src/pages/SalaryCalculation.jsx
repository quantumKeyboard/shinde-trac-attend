import React, { useState, useMemo } from 'react';
import { ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import { useWorkingDays } from '../hooks/useWorkingDays';
import { 
  useMonthlySalaryCalculations,
  useCalculateEmployeeSalaries,
  useBulkSaveSalaryCalculations 
} from '../hooks/useSalary';

const SalaryCalculation = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [calculatedSalaries, setCalculatedSalaries] = useState([]);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Queries
  const { data: employees } = useEmployees();
  const { data: workingDaysData } = useWorkingDays(selectedMonth, selectedYear);
  const { data: savedSalaries } = useMonthlySalaryCalculations(selectedMonth, selectedYear);
  
  // Mutations
  const calculateMutation = useCalculateEmployeeSalaries();
  const saveMutation = useBulkSaveSalaryCalculations();

  // Get unique departments
  const departments = useMemo(() => {
    if (!employees) return [];
    const depts = [...new Set(employees.map(e => e.department))];
    return ['all', ...depts];
  }, [employees]);

  // Filter employees by department
  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    if (selectedDepartment === 'all') return employees;
    return employees.filter(e => e.department === selectedDepartment);
  }, [employees, selectedDepartment]);

  const handleCalculateSalaries = async () => {
    const employeeIds = filteredEmployees.map(e => e.id);
    
    const results = await calculateMutation.mutateAsync({
      employeeIds,
      month: selectedMonth,
      year: selectedYear
    });
    
    setCalculatedSalaries(results.filter(r => r.success).map(r => r.data));
  };

  const handleSaveAllSalaries = async () => {
    const toSave = calculatedSalaries.map(salary => ({
      employee_id: salary.employee_id,
      month: selectedMonth,
      year: selectedYear,
      monthly_salary: salary.monthly_salary,
      days_present: salary.days_present,
      days_absent_unpaid: salary.days_absent_unpaid,
      days_absent_paid: salary.days_absent_paid,
      sundays_in_month: salary.sundays_in_month,
      sundays_worked: salary.sundays_worked,
      sundays_absent: salary.sundays_absent,
      sunday_compensation_days: salary.sunday_compensation_days,
      sunday_overtime_days: salary.sunday_overtime_days,
      per_day_rate: salary.per_day_rate,
      deduction_amount: salary.deduction_amount,
      overtime_amount: salary.overtime_amount,
      payable_salary: salary.payable_salary,
      total_working_days: salary.total_working_days
    }));

    await saveMutation.mutateAsync(toSave);
    setShowSavePrompt(false);
    setCalculatedSalaries([]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getEmployeeName = (employeeId) => {
    const emp = employees?.find(e => e.id === employeeId);
    return emp?.full_name || 'Unknown';
  };

  const isAlreadySaved = (empId) => {
    return savedSalaries?.some(s => s.employee_id === empId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-200 rounded-lg transition"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Salary Calculation</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month & Year
          </label>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2024, i).toLocaleString('en-IN', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculateSalaries}
          disabled={calculateMutation.isPending || filteredEmployees.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {calculateMutation.isPending ? (
            <>
              <Loader size={20} className="animate-spin" />
              Calculating...
            </>
          ) : (
            `Calculate for ${filteredEmployees.length} Employee(s)`
          )}
        </button>
      </div>

      {workingDaysData && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Total Working Days:</strong> {workingDaysData.total_working_days}
          </p>
        </div>
      )}

      {calculatedSalaries.length > 0 && (
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Calculated Salaries ({calculatedSalaries.length})
            </h2>
            {!showSavePrompt && (
              <button
                onClick={() => setShowSavePrompt(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Save All
              </button>
            )}
          </div>

          {showSavePrompt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-gray-700">
                Save {calculatedSalaries.length} salary calculation(s) to database?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAllSalaries}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Confirm Save'}
                </button>
                <button
                  onClick={() => setShowSavePrompt(false)}
                  disabled={saveMutation.isPending}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-400 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
              {saveMutation.isSuccess && (
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle size={16} /> Salaries saved successfully!
                </p>
              )}
              {saveMutation.isError && (
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle size={16} /> Error saving salaries
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {calculatedSalaries.map((salary) => {
              const empName = getEmployeeName(salary.employee_id);
              const alreadySaved = isAlreadySaved(salary.employee_id);

              return (
                <div
                  key={salary.employee_id}
                  className={`border rounded-lg p-4 ${
                    alreadySaved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{empName}</p>
                      <p className="text-xs text-gray-500">
                        {alreadySaved && ' Already Saved'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(salary.payable_salary)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-200">
                    <div className="text-sm">
                      <p className="text-gray-600">Present Days</p>
                      <p className="font-semibold text-gray-900">{salary.days_present}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">Absent Days</p>
                      <p className="font-semibold text-gray-900">{salary.days_absent_unpaid}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-gray-200 bg-orange-50 p-2 rounded">
                    <div className="text-sm">
                      <p className="text-gray-600">Sundays Worked</p>
                      <p className="font-semibold text-orange-600">{salary.sundays_worked}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-600">Sundays Absent</p>
                      <p className="font-semibold text-orange-600">{salary.sundays_absent}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-600">Compensation</p>
                      <p className="font-semibold text-green-600">
                        {salary.sunday_compensation_days}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Overtime</p>
                      <p className="font-semibold text-purple-600">
                        {salary.sunday_overtime_days}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2 rounded text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Salary</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(salary.monthly_salary)}
                      </span>
                    </div>
                    {salary.deduction_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deduction</span>
                        <span className="font-medium text-red-600">
                          -{formatCurrency(salary.deduction_amount)}
                        </span>
                      </div>
                    )}
                    {salary.overtime_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Overtime</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(salary.overtime_amount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-1 flex justify-between">
                      <span className="font-semibold text-gray-900">Final Salary</span>
                      <span className="font-bold text-gray-900">
                        {formatCurrency(salary.payable_salary)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calculatedSalaries.length === 0 && !calculateMutation.isPending && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            Select filters and click "Calculate" to see salary calculations
          </p>
        </div>
      )}
    </div>
  );
};

export default SalaryCalculation;
