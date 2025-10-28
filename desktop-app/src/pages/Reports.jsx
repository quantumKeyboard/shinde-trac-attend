import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Export</h1>
        <p className="text-gray-600 mt-1">Generate and export various reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Attendance Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Monthly Attendance Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete attendance data for all employees with present/absent statistics
              </p>
              <button className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Salary Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Salary Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Monthly salary calculations with deductions and payable amounts
              </p>
              <button className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Employee Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Employee-wise Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Individual employee attendance history and salary details
              </p>
              <button className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>

        {/* Department Report */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Department Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Department-wise attendance and salary analysis
              </p>
              <button className="btn-primary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="font-bold text-gray-900 mb-4">Export Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Excel Files</h4>
            <p className="text-sm text-gray-600">
              Structured data in .xlsx format for analysis and record keeping
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">📱 WhatsApp Messages</h4>
            <p className="text-sm text-gray-600">
              Copy-paste ready text format for sharing via WhatsApp
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">🖼️ Salary Cards</h4>
            <p className="text-sm text-gray-600">
              Professional PNG images for printing or digital sharing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
