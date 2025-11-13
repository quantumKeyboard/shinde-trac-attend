import { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Save, RefreshCw } from 'lucide-react';
import { useWorkingDays, useSetWorkingDays } from '../hooks/useWorkingDays';
import { useAuthStore } from '../store';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function WorkingDays() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDepartment, setSelectedDepartment] = useState('Salesman');
  const [workingDates, setWorkingDates] = useState([]);
  const { user } = useAuthStore();

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const allDatesInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Use React Query hooks for caching
  const { data: workingDaysData, isLoading: loading, refetch, isFetching } = useWorkingDays(month, year, selectedDepartment);
  const setWorkingDaysMutation = useSetWorkingDays();

  // Update local state when data is loaded
  useEffect(() => {
    if (workingDaysData && workingDaysData.working_dates) {
      setWorkingDates(workingDaysData.working_dates.map(d => format(new Date(d), 'yyyy-MM-dd')));
    } else {
      setWorkingDates([]);
    }
  }, [workingDaysData]);

  // Manual refresh function
  const handleRefresh = async () => {
    await refetch();
    toast.success('Data refreshed');
  };

  const toggleDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setWorkingDates(prev =>
      prev.includes(dateStr)
        ? prev.filter(d => d !== dateStr)
        : [...prev, dateStr].sort()
    );
  };

  const handleMarkAllDays = () => {
    setWorkingDates(allDatesInMonth.map(d => format(d, 'yyyy-MM-dd')));
    toast.success('All days marked as working days');
  };

  const handleMarkWeekdays = () => {
    const weekdays = allDatesInMonth.filter(d => {
      const day = d.getDay();
      return day !== 0; // Exclude Sunday
    });
    setWorkingDates(weekdays.map(d => format(d, 'yyyy-MM-dd')));
    toast.success('Weekdays marked (Monday-Saturday)');
  };

  const handleClearAll = () => {
    setWorkingDates([]);
    toast.success('All working days cleared');
  };

  const handleSave = async () => {
    if (workingDates.length === 0) {
      toast.error('Please mark at least one working day');
      return;
    }

    const workingDaysDataToSave = {
      month,
      year,
      department: selectedDepartment,
      total_working_days: workingDates.length,
      working_dates: workingDates,
      created_by: user?.id,
      updated_by: user?.id
    };

    await setWorkingDaysMutation.mutateAsync(workingDaysDataToSave);
  };

  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Working Days Configuration</h1>
          <p className="text-gray-600 mt-1">Set working days for salary calculation</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isFetching}
          className="btn-secondary flex items-center gap-2"
          title="Refresh data from database"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={handleMarkAllDays} className="btn-secondary">
            Mark All Days
          </button>
          <button onClick={handleMarkWeekdays} className="btn-secondary">
            Mark Weekdays (Mon-Sat)
          </button>
          <button onClick={handleClearAll} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
            Clear All
          </button>
          <div className="flex-1"></div>
          <button
            onClick={handleSave}
            disabled={setWorkingDaysMutation.isPending || workingDates.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {setWorkingDaysMutation.isPending ? 'Saving...' : 'Save Working Days'}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {format(new Date(year, month - 1), 'MMMM yyyy')} - {selectedDepartment}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Click on dates below to mark/unmark as working days
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{workingDates.length}</div>
            <div className="text-sm text-gray-600">Working Days</div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-6">
        <div className="grid grid-cols-7 gap-3">
          {/* Day headers */}
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for alignment */}
          {Array.from({ length: monthStart.getDay() }).map((_, idx) => (
            <div key={`empty-${idx}`} />
          ))}

          {/* Date cells */}
          {allDatesInMonth.map((date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isWorking = workingDates.includes(dateStr);
            const isSunday = date.getDay() === 0;

            return (
              <button
                key={dateStr}
                onClick={() => toggleDate(date)}
                className={`
                  min-h-[100px] p-3 rounded-lg border-2 transition-all
                  ${isWorking
                    ? 'border-green-500 bg-green-50 hover:bg-green-100'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }
                  ${isSunday ? 'bg-red-50' : ''}
                `}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {format(date, 'd')}
                  </div>
                  <div className={`text-xs mt-1 ${isSunday ? 'text-red-600' : 'text-gray-600'}`}>
                    {getDayName(date)}
                  </div>
                  {isWorking && (
                    <div className="mt-2">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4 mt-6">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
            <span>Working Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded"></div>
            <span>Non-Working Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-50 border-2 border-gray-200 rounded"></div>
            <span>Sunday</span>
          </div>
        </div>
      </div>
    </div>
  );
}
