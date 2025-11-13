import { useState } from 'react';
import { Plus, Search, Edit2, UserX, Phone, Calendar as CalendarIcon, User, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeactivateEmployee } from '../hooks/useEmployees';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function Employees() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading, refetch, isFetching } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deactivateEmployee = useDeactivateEmployee();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('Active');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    full_name: '',
    department: 'Salesman',
    monthly_salary: '',
    contact_number: '',
    date_of_joining: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const employeeData = {
        ...formData,
        created_by: user?.id,
        updated_by: user?.id,
      };

      if (editingEmployee) {
        await updateEmployee.mutateAsync({
          id: editingEmployee.id,
          updates: employeeData,
          oldData: editingEmployee
        });
      } else {
        await createEmployee.mutateAsync(employeeData);
      }

      setShowModal(false);
      setEditingEmployee(null);
      resetForm();
    } catch (error) {
      // Error handling is done in the hooks
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      department: 'Salesman',
      monthly_salary: '',
      contact_number: '',
      date_of_joining: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      department: employee.department,
      monthly_salary: employee.monthly_salary,
      contact_number: employee.contact_number || '',
      date_of_joining: employee.date_of_joining,
    });
    setShowModal(true);
  };

  const handleDeactivate = async (employee) => {
    if (confirm(`Are you sure you want to deactivate ${employee.full_name}?`)) {
      try {
        await deactivateEmployee.mutateAsync({ id: employee.id });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">
            {isLoading ? 'Loading...' : `${employees.length} total employees`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="btn-secondary flex items-center gap-2"
            title="Refresh employee list"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingEmployee(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="input-field"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  title="Click to view details"
                >
                  <h3 className="text-lg font-bold text-gray-900 hover:text-blue-600 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {employee.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.employee_id}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  employee.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Department:</strong> {employee.department}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Salary:</strong> ₹{employee.monthly_salary.toLocaleString('en-IN')}/month
                </p>
                {employee.contact_number && (
                  <p className="text-sm text-gray-700 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {employee.contact_number}
                  </p>
                )}
                <p className="text-sm text-gray-700 flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Joined: {format(new Date(employee.date_of_joining), 'dd MMM yyyy')}
                </p>
              </div>

              {employee.status === 'Active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(employee)}
                    className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(employee)}
                    className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    Deactivate
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p>No employees found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Enter employee full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter salary amount"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Contact Number</label>
                  <input
                    type="tel"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="input-field"
                    placeholder="Enter contact number"
                  />
                </div>

                <div>
                  <label className="label">Date of Joining *</label>
                  <input
                    type="date"
                    value={formData.date_of_joining}
                    onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                    className="input-field"
                    required
                    max={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingEmployee(null);
                    resetForm();
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
