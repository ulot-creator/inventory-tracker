"use client";

import { useState } from 'react';
import DashboardOverview from "@/components/DashboardOverview";
import InventoryTable from "@/components/InventoryTable";
import AddItemModal from "@/components/AddItemModal";

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Monitor your current stock levels and alerts.</p>
      </div>
      
      <DashboardOverview />
      
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Current Inventory</h2>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            + Add Item
          </button>
        </div>
        <InventoryTable />
      </div>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
