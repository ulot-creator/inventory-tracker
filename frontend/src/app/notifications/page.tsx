"use client";

import { Bell, AlertTriangle, CheckCircle2, Package, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const alerts = [
    {
      id: 1,
      type: 'low_stock',
      title: 'Low Stock Alert: Laptop Stand',
      description: 'Current quantity (5) is below the threshold of 10.',
      time: '12 minutes ago',
      read: false,
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-50'
    },
    {
      id: 2,
      type: 'out_of_stock',
      title: 'Item Out of Stock: USB-C Hub',
      description: 'Quantity has reached 0. Restocking recommended.',
      time: '2 hours ago',
      read: false,
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      bg: 'bg-red-50'
    },
    {
      id: 3,
      type: 'update',
      title: 'Stock Update Successful',
      description: 'Inventory for "Wireless Mouse" was successfully updated (+50).',
      time: 'Yesterday at 4:30 PM',
      read: true,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-50'
    },
    {
      id: 4,
      type: 'system',
      title: 'Database Sync Complete',
      description: 'All 12,450 records synced with the central database.',
      time: '2 days ago',
      read: true,
      icon: <Package className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-50'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1 text-sm">Stay updated on your inventory alerts and system status.</p>
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Mark all as read
        </button>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${!alert.read ? 'border-l-4 border-l-indigo-500' : 'pl-[1.25rem]'}`}>
              <div className={`p-2 rounded-lg h-fit ${alert.bg}`}>
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold truncate ${!alert.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {alert.title}
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {alert.time}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  {alert.description}
                </p>
                {!alert.read && (
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 mt-2">
                    Accept & Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
            Load older notifications
          </button>
        </div>
      </div>
    </div>
  );
}
