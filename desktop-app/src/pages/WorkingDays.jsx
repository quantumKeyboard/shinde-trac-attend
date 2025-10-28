import React from 'react';
import { Calendar } from 'lucide-react';

export default function WorkingDays() {
  return (
    <div className="p-8">
      <div className="card p-12 text-center">
        <Calendar className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Working Days Management</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Configure working days for each department by month. Set different working day 
          schedules for Salesman, Mechanic, and Housekeeping departments.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Working days can also be configured via the Mobile PWA 
            for convenience. Desktop app provides additional bulk editing capabilities.
          </p>
        </div>
      </div>
    </div>
  );
}
