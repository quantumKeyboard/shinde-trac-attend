import { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { workingDaysService, auditService } from '../services/api';
import { useAuthStore } from '../store';

const DEPARTMENTS = ['Salesman', 'Mechanic', 'Housekeeping', 'Management'];

export default function WorkingDays() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDepartment, setSelectedDepartment] = useState('Salesman');
  const [workingDates, setWorkingDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  const allDatesInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    loadWorkingDays();
  }, [selectedMonth, selectedDepartment]);

  const loadWorkingDays = async () => {
    setLoading(true);
    try {
      const data = await workingDaysService.getWorkingDays(month, year, selectedDepartment);
      if (data && data.working_dates) {
        setWorkingDates(data.working_dates.map(d => format(new Date(d), 'yyyy-MM-dd')));
      } else {
        setWorkingDates([]);
      }
    } catch (error) {
      console.error('Load error:', error);
      setWorkingDates([]);
    } finally {
      setLoading(false);
    }
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

    setSaving(true);
    try {
      const workingDaysData = {
        month,
        year,
        department: selectedDepartment,
        total_working_days: workingDates.length,
        working_dates: workingDates,
        created_by: user?.id,
        updated_by: user?.id
      };

      await workingDaysService.setWorkingDays(workingDaysData);

      // Log action
      await auditService.logAction(
        'SET_WORKING_DAYS',
        'working_days',
        null,
        null,
        { month, year, department: selectedDepartment, count: workingDates.length }
      );

      toast.success('Working days saved successfully');
    } catch (error) {
      toast.error('Failed to save working days');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const getDayName = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Working Days</h2>
        <p className="text-gray-600">Mark working days for the month</p>
      </div>

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CalendarIcon className="inline w-4 h-4 mr-2" />
          Select Month
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Department Selector */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Department
        </label>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          {DEPARTMENTS.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={handleMarkAllDays}
          className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors touch-target"
        >
          All Days
        </button>
        <button
          onClick={handleMarkWeekdays}
          className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors touch-target"
        >
          Weekdays
        </button>
        <button
          onClick={handleClearAll}
          className="bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors touch-target"
        >
          Clear All
        </button>
      </div>

      {/* Summary */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-primary-900 font-semibold">Working Days Selected:</span>
          <span className="text-2xl font-bold text-primary-600">{workingDates.length}</span>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {format(new Date(year, month - 1), 'MMMM yyyy')}
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {/* Weekday headers */}
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Date cells */}
            {allDatesInMonth.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const isSelected = workingDates.includes(dateStr);
              const isSunday = date.getDay() === 0;
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <button
                  key={i}
                  onClick={() => toggleDate(date)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all touch-target ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : isSunday
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{date.getDate()}</span>
                  <span className="text-[10px] opacity-75">{getDayName(date)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 safe-area-bottom">
        <button
          onClick={handleSave}
          disabled={saving || workingDates.length === 0}
          className="w-full bg-primary-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Working Days
            </>
          )}
        </button>
      </div>
    </div>
  );
}
