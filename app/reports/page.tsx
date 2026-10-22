'use client';

import Sidebar from '@/components/Sidebar';
import { BarChart3, Printer } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Financial Reports & Analytics</h1>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Sales Summary Report</h2>
              </div>
              <p className="text-sm text-slate-600">
                View comprehensive sales data, gross vs net revenue, payment summaries, and cashier performance calculated directly from Cloud PostgreSQL records.
              </p>
              <a href="/sales" className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                View Sales History →
              </a>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Inventory & Stock Valuation</h2>
              </div>
              <p className="text-sm text-slate-600">
                Track stock on hand, purchase cost valuations, and low-stock threshold alerts across all units (bags, kg, pieces).
              </p>
              <a href="/products" className="inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                View Products Inventory →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
