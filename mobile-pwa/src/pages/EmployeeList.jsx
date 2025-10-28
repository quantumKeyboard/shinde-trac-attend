import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, UserX, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../services/api';
import toast from 'react-hot-toast';

export default function EmployeeList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getActiveEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error('Failed to load employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
        <p className="text-gray-600">{employees.length} active employees</p>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="All">All Departments</option>
          <option value="Salesman">Salesman</option>
          <option value="Mechanic">Mechanic</option>
          <option value="Housekeeping">Housekeeping</option>
        </select>
      </div>

      {/* Employee Cards */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No employees found</p>
          </div>
        ) : (
          filteredEmployees.map(employee => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-md p-4 cursor-pointer active:bg-gray-50"
              onClick={() => navigate(`/employees/${employee.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {employee.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {employee.employee_id} • {employee.department}
                  </p>
                  <p className="text-sm font-semibold text-primary-600 mt-2">
                    ₹{employee.monthly_salary.toLocaleString('en-IN')}/month
                  </p>
                  {employee.contact_number && (
                    <p className="text-sm text-gray-600 mt-1">
                      📱 {employee.contact_number}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Joined: {new Date(employee.date_of_joining).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tap to view details */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Tap on any employee to view their detailed attendance history and generate reports.
        </p>
      </div>
    </div>
  );
}
