"use client";

import { useEffect, useState, useCallback } from 'react';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { inventoryService, InventoryItem } from '@/lib/api';

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState([
    { title: 'Total Items', value: '0', change: '0', isPositive: true, icon: <Package className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50' },
    { title: 'Low Stock Alerts', value: '0', change: '0', isPositive: true, icon: <AlertTriangle className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50' },
    { title: 'Out of Stock', value: '0', change: '0', isPositive: false, icon: <AlertTriangle className="w-6 h-6 text-red-500" />, bg: 'bg-red-50' }
  ]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const allItems = await inventoryService.getAll();
      const lowStockItems = await inventoryService.getLowStock();
      
      const totalCount = allItems.length;
      const lowStockCount = lowStockItems.length;
      const outOfStockCount = allItems.filter(i => i.quantity === 0).length;

      setMetrics([
        {
          title: 'Total Items',
          value: totalCount.toString(),
          change: 'Realtime',
          isPositive: true,
          icon: <Package className="w-6 h-6 text-indigo-500" />,
          bg: 'bg-indigo-50'
        },
        {
          title: 'Low Stock Alerts',
          value: lowStockCount.toString(),
          change: 'Alert',
          isPositive: lowStockCount === 0,
          icon: <AlertTriangle className="w-6 h-6 text-amber-500" />,
          bg: 'bg-amber-50'
        },
        {
          title: 'Out of Stock',
          value: outOfStockCount.toString(),
          change: 'Critical',
          isPositive: outOfStockCount === 0,
          icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
          bg: 'bg-red-50'
        }
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    
    // Refresh metrics when inventory updates (custom events from other components)
    window.addEventListener('inventoryUpdated', fetchMetrics);
    window.addEventListener('refreshInventory', fetchMetrics);
    
    return () => {
      window.removeEventListener('inventoryUpdated', fetchMetrics);
      window.removeEventListener('refreshInventory', fetchMetrics);
    };
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center h-32 animate-pulse">
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-1">{metric.title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
            
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${metric.change === 'Realtime' ? 'text-indigo-600' : metric.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              <span>{metric.change}</span>
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${metric.bg}`}>
            {metric.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
