import React from 'react';
import { CalendarCheck } from 'lucide-react';

export default function Attendance() {
  return (
    <div className="p-8">
      <div className="card p-12 text-center">
        <CalendarCheck className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Management</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Full attendance viewing, editing, and management interface. View monthly calendar, 
          edit past attendance records, and analyze attendance patterns.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Daily attendance marking is done via the Mobile PWA. 
            This desktop interface allows viewing and editing attendance records.
          </p>
        </div>
      </div>
    </div>
  );
}
