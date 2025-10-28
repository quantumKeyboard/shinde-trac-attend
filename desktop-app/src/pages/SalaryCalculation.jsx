import React from 'react';
import { DollarSign } from 'lucide-react';

export default function SalaryCalculation() {
  return (
    <div className="p-8">
      <div className="card p-12 text-center">
        <DollarSign className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Salary Calculation</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Month-end salary processing interface. Calculate salaries for all employees based on 
          attendance and working days. Review calculations, generate summaries, and export reports.
        </p>
        <div className="space-y-4 max-w-2xl mx-auto text-left">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">Features:</h3>
            <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
              <li>Automatic salary calculation with deductions</li>
              <li>Paid vs unpaid leave handling</li>
              <li>Formula display for transparency</li>
              <li>Bulk processing for all employees</li>
              <li>WhatsApp message generation</li>
              <li>Professional salary card images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
