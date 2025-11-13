import { useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { DollarSign, Calendar, Download, RefreshCw, CheckCircle, AlertCircle, Sun } from 'lucide-react';
import { useActiveEmployees } from '../hooks/useEmployees';
import { useSaveSalaryCalculation } from '../hooks/useSalary';
import { salaryService } from '../services/api';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function SalaryCalculation() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(format(currentDate, 'yyyy-MM'));
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [calculations, setCalculations] = useState([]);
  const [calculating, setCalculating] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'calculated', 'pending'

  const { data: allEmployees = [], refetch: refetchEmployees, isFetching: employeesFetching } = useActiveEmployees();
  const saveSalaryCalculation = useSaveSalaryCalculation();

  const [year, month] = selectedMonth.split('-').map(Number);

  const handleCalculateAll = async () => {
    setCalculating(true);
    try {
      const employeesToCalculate = selectedDepartment === 'All'
        ? allEmployees
        : allEmployees.filter(emp => emp.department === selectedDepartment);

      if (employeesToCalculate.length === 0) {
        toast.error('No employees to calculate');
        return;
      }

      const calculationResults = [];
      
      for (const employee of employeesToCalculate) {
        try {
          const calculation = await salaryService.calculateMonthlySalary(employee.id, month, year);
          calculationResults.push({
            employee,
            calculation,
            status: 'success'
          });
        } catch (error) {
          calculationResults.push({
            employee,
            error: error.message,
            status: 'error'
          });
        }
      }

      setCalculations(calculationResults);
      toast.success(`Calculated salaries for ${calculationResults.filter(r => r.status === 'success').length} employees`);
    } catch (error) {
      toast.error('Failed to calculate salaries');
      console.error(error);
    } finally {
      setCalculating(false);
    }
  };

  const handleSaveCalculation = async (employeeId) => {
    const result = calculations.find(c => c.employee.id === employeeId);
    if (!result || result.status !== 'success') return;

    try {
      // Use the mutation which will automatically invalidate all related queries
      await saveSalaryCalculation.mutateAsync(result.calculation);
      
      // The toast is handled by the mutation hook
      // Update the result status to show it's saved
      setCalculations(calculations.map(c => 
        c.employee.id === employeeId 
          ? { ...c, saved: true }
          : c
      ));
      
      // Refresh employees data to show updated info
      refetchEmployees();
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error(error);
    }
  };

  const handleSaveAll = async () => {
    const successfulCalculations = calculations.filter(c => c.status === 'success');
    
    for (const result of successfulCalculations) {
      try {
        await salaryService.saveSalaryCalculation(result.calculation);
      } catch (error) {
        console.error(`Failed to save for ${result.employee.full_name}:`, error);
      }
    }

    toast.success('All calculations saved');
    setCalculations(calculations.map(c => ({ ...c, saved: true })));
  };

  const filteredCalculations = calculations.filter(c => {
    if (filter === 'calculated') return c.status === 'success';
    if (filter === 'pending') return c.status === 'error';
    return true;
  });

  const totalCalculated = calculations.filter(c => c.status === 'success').length;
  const totalErrors = calculations.filter(c => c.status === 'error').length;
  const totalPayable = calculations
    .filter(c => c.status === 'success')
    .reduce((sum, c) => sum + c.calculation.payable_salary, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Salary Calculation</h1>
          <p className="text-gray-600 mt-1">Calculate monthly salaries with Sunday compensation</p>
        </div>
        <button
          onClick={refetchEmployees}
          disabled={employeesFetching}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${employeesFetching ? 'animate-spin' : ''}`} />
          {employeesFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Control Panel */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
              max={format(currentDate, 'yyyy-MM')}
            />
          </div>

          <div>
            <label className="label">Department</label>
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
              onClick={handleCalculateAll}
              disabled={calculating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              {calculating ? 'Calculating...' : 'Calculate Salaries'}
            </button>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSaveAll}
              disabled={calculations.length === 0 || calculating}
              className="btn-success w-full flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Save All
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sun className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">Sunday Work Compensation Rules:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li><strong>Sundays are PAID holidays</strong> - Being absent on Sunday has NO penalty</li>
                <li><strong>Working on Sunday:</strong> Can compensate previous unpaid absences (1:1 ratio)</li>
                <li><strong>After compensation:</strong> Remaining Sunday work is paid as overtime</li>
                <li><strong>Only regular day absences</strong> are deducted from salary</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {calculations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 bg-blue-50">
            <div className="text-sm text-blue-600 mb-1">Total Employees</div>
            <div className="text-2xl font-bold text-blue-900">{calculations.length}</div>
          </div>
          <div className="card p-4 bg-green-50">
            <div className="text-sm text-green-600 mb-1">Successfully Calculated</div>
            <div className="text-2xl font-bold text-green-900">{totalCalculated}</div>
          </div>
          <div className="card p-4 bg-red-50">
            <div className="text-sm text-red-600 mb-1">Errors</div>
            <div className="text-2xl font-bold text-red-900">{totalErrors}</div>
          </div>
          <div className="card p-4 bg-purple-50">
            <div className="text-sm text-purple-600 mb-1">Total Payable</div>
            <div className="text-2xl font-bold text-purple-900">₹{totalPayable.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {calculations.length > 0 && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            All ({calculations.length})
          </button>
          <button
            onClick={() => setFilter('calculated')}
            className={`px-4 py-2 rounded-lg font-semibold ${filter === 'calculated' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Success ({totalCalculated})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold ${filter === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Errors ({totalErrors})
          </button>
        </div>
      )}

      {/* Calculations List */}
      {calculations.length === 0 ? (
        <div className="card p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Calculations Yet</h3>
          <p className="text-gray-600">
            Select a month and department, then click "Calculate Salaries" to begin
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalculations.map((result) => (
            <div key={result.employee.id} className={`card p-6 ${result.status === 'error' ? 'border-2 border-red-300' : ''}`}>
              {result.status === 'error' ? (
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{result.employee.full_name}</h3>
                    <p className="text-sm text-gray-600">{result.employee.employee_id} • {result.employee.department}</p>
                    <p className="text-red-600 mt-2">{result.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Employee Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{result.employee.full_name}</h3>
                      <p className="text-sm text-gray-600">{result.employee.employee_id} • {result.employee.department}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.saved && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Saved
                        </span>
                      )}
                      <button
                        onClick={() => handleSaveCalculation(result.employee.id)}
                        disabled={result.saved || saveSalaryCalculation.isPending}
                        className={`btn-secondary text-sm flex items-center gap-2 ${
                          saveSalaryCalculation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {saveSalaryCalculation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : result.saved ? (
                          'Saved'
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sunday Summary */}
                  {result.calculation.sundays_in_month > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-orange-900">
                        <Sun className="w-4 h-4" />
                        <span className="font-semibold">Sunday Summary:</span>
                        <span>
                          {result.calculation.sundays_in_month} Sunday(s) in month •
                          {result.calculation.sundays_worked} worked •
                          {result.calculation.sundays_absent} absent (paid holiday - no penalty)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Calculation Details */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-blue-600 mb-1">Working Days</div>
                      <div className="text-lg font-bold text-blue-900">{result.calculation.total_working_days}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-green-600 mb-1">Present</div>
                      <div className="text-lg font-bold text-green-900">{result.calculation.days_present}</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-xs text-yellow-600 mb-1">Paid Leaves</div>
                      <div className="text-lg font-bold text-yellow-900">{result.calculation.days_absent_paid}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-xs text-red-600 mb-1">Unpaid Absences</div>
                      <div className="text-lg font-bold text-red-900">{result.calculation.days_absent_unpaid}</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-xs text-orange-600 mb-1 flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        Compensation
                      </div>
                      <div className="text-lg font-bold text-orange-900">{result.calculation.sunday_compensation_days}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                        <Sun className="w-3 h-3" />
                        Overtime
                      </div>
                      <div className="text-lg font-bold text-purple-900">{result.calculation.sunday_overtime_days}</div>
                    </div>
                  </div>

                  {/* Salary Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Monthly Salary</span>
                      <span className="font-semibold">₹{result.calculation.monthly_salary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Per Day Rate (Salary ÷ Days in Month)</span>
                      <span className="font-semibold">₹{result.calculation.per_day_rate.toFixed(2)}</span>
                    </div>
                    {result.calculation.sunday_compensation_days > 0 && (
                      <div className="flex justify-between text-sm text-orange-700">
                        <span>Sunday Compensation ({result.calculation.sunday_compensation_days} days)</span>
                        <span className="font-semibold">Covers {result.calculation.sunday_compensation_days} absences</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Deduction (After compensation)</span>
                      <span className="font-semibold">- ₹{result.calculation.deduction_amount.toFixed(2)}</span>
                    </div>
                    {result.calculation.sunday_overtime_days > 0 && (
                      <div className="flex justify-between text-sm text-purple-600">
                        <span>Sunday Overtime ({result.calculation.sunday_overtime_days} days)</span>
                        <span className="font-semibold">+ ₹{result.calculation.overtime_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                      <span className="font-bold text-gray-900">Final Payable Salary</span>
                      <span className="text-xl font-bold text-green-600">₹{result.calculation.payable_salary.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
