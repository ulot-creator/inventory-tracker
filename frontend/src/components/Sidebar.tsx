import Link from 'next/link';
import { LayoutDashboard, PackageSearch, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col pt-6 pb-4 px-4 sticky top-0 h-screen overflow-y-auto z-10 hidden md:flex">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xl">
          I
        </div>
        <h1 className="text-xl font-bold tracking-tight">InventoryNet</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors group"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link 
          href="/items" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
        >
          <PackageSearch className="w-5 h-5" />
          <span className="font-medium">Items</span>
        </Link>
      </nav>

      <div className="mt-8 pt-4 border-t border-slate-800 space-y-2">
         <Link 
          href="/settings" 
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors group"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
      
      <div className="mt-auto px-1 py-4 flex items-center gap-3">
         <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
           <span className="text-xs font-medium">AD</span>
         </div>
         <div className="flex flex-col flex-1 min-w-0">
           <span className="text-sm font-medium truncate">Admin User</span>
           <span className="text-xs text-slate-400 truncate">admin@inventory.net</span>
         </div>
      </div>
    </aside>
  );
}
