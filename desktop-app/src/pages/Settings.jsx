import React from 'react';
import { Settings as SettingsIcon, Shield, Database, Bell } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure system preferences and security</p>
      </div>

      <div className="space-y-6">
        {/* Company Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Company Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Company Name</label>
              <input type="text" defaultValue="Shinde Tractors" className="input-field" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Session Timeout</p>
                <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
              </div>
              <select className="input-field w-48">
                <option value="15">15 minutes</option>
                <option value="30" selected>30 minutes</option>
                <option value="60">60 minutes</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Max Past Edit Days</p>
                <p className="text-sm text-gray-600">Days allowed to edit past attendance</p>
              </div>
              <input type="number" defaultValue="3" min="1" max="30" className="input-field w-48" />
            </div>
          </div>
        </div>

        {/* Backup Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Backup Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Auto Backup</p>
                <p className="text-sm text-gray-600">Automatic weekly database backup</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <button className="btn-primary">
              Backup Now
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">High Absence Alerts</p>
                <p className="text-sm text-gray-600">Notify when employee absences exceed threshold</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
