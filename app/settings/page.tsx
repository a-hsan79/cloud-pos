'use client';

import Sidebar from '@/components/Sidebar';
import { Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">System & Business Settings</h1>
        </header>

        <div className="p-8 space-y-6 max-w-3xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center space-x-3 border-b pb-4">
              <SettingsIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Cloud Data Persistence Architecture</h2>
            </div>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start space-x-3 rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                <ShieldCheck className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-900">Zero Local Business Data Storage Policy</p>
                  <p className="mt-1 text-xs text-indigo-700 leading-relaxed">
                    This POS application is fully cloud-based. All sales, payments, inventory stock movements, customers, and expenses are persistently stored in managed cloud PostgreSQL (Neon). No local browser database (IndexedDB, localStorage for business records) or offline transaction queue is used.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Database Provider</label>
                <input
                  type="text"
                  disabled
                  defaultValue="Neon Managed Cloud PostgreSQL"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Hosting Environment</label>
                <input
                  type="text"
                  disabled
                  defaultValue="Vercel Serverless Production"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
