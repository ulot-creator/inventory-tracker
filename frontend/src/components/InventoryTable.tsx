"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Edit2, Trash2, Loader2 } from 'lucide-react';
import { inventoryService, InventoryItem } from '@/lib/api';

export default function InventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAll();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    
    // Listen for custom event to refresh data (triggered by AddItemModal)
    window.addEventListener('refreshInventory', fetchItems);
    return () => window.removeEventListener('refreshInventory', fetchItems);
  }, []);

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    try {
      await inventoryService.updateQuantity(id, newQuantity);
      setItems(items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
      // Dispatch refresh event for DashboardOverview
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryService.delete(id);
      setItems(items.filter(i => i.id !== id));
      // Dispatch refresh event for DashboardOverview
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-red-500">
        <p>{error}</p>
        <button 
          onClick={fetchItems}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by SKU or Name..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 w-full sm:w-auto transition-colors">
          <Filter className="w-4 h-4" />
          More Filters
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-600 bg-slate-50/80 border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">SKU</th>
              <th className="px-6 py-4 font-semibold">Product Name</th>
              <th className="px-6 py-4 font-semibold hidden md:table-cell">Category</th>
              <th className="px-6 py-4 font-semibold">Stock</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-medium text-slate-600">{item.sku}</td>
                <td className="px-6 py-4 text-slate-500">{item.name}</td>
                <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{item.category}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id!, Math.max(0, item.quantity - 1))}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      -
                    </button>
                    <div className="flex items-center gap-1 min-w-[3rem] justify-center">
                      <span className="font-semibold text-slate-900">{item.quantity}</span>
                      <span className="text-slate-600 text-xs font-medium">{item.unit || 'pcs'}</span>
                    </div>
                    <button 
                      onClick={() => handleUpdateQuantity(item.id!, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.quantity === 0
                      ? 'bg-red-100/80 text-red-800 border border-red-200/50'
                      : item.quantity <= (item.lowStockThreshold || 10)
                        ? 'bg-amber-100/80 text-amber-800 border border-amber-200/50' 
                        : 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/50'
                  }`}>
                    {item.quantity === 0 ? 'Out of Stock' : item.quantity <= (item.lowStockThreshold || 10) ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id!)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-600 font-medium italic">
                  No inventory items found. Add your first item to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
