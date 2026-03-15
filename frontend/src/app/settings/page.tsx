"use client";

import { User, Bell, Shield, Database, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Configure your inventory preferences and account details.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-8">
          {/* Profile Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <User className="w-5 h-5 text-indigo-500" />
              <h3>Account Profile</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-7">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Display Name</label>
                <input type="text" defaultValue="Admin User" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" defaultValue="admin@inventory.net" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
              </div>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Notifications Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Bell className="w-5 h-5 text-indigo-500" />
              <h3>Notifications</h3>
            </div>
            <div className="space-y-3 pl-7">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">Receive email alerts for low-stock items</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="text-sm text-slate-700">Daily summary of inventory movements</span>
              </label>
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* Advanced Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Database className="w-5 h-5 text-indigo-500" />
              <h3>Data Management</h3>
            </div>
            <div className="pl-7 space-y-4">
              <p className="text-sm text-slate-500 italic">Connected to local SQLite database: <code>inventory_tracker.sqlite</code></p>
              <button className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
                Reset Database
              </button>
            </div>
          </section>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
