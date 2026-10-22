'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Receipt,
  Wallet,
  Calculator,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS Checkout', href: '/pos', icon: ShoppingCart },
  { name: 'Products & Stock', href: '/products', icon: Package },
  { name: 'Customers & Ledger', href: '/customers', icon: Users },
  { name: 'Sales History', href: '/sales', icon: Receipt },
  { name: 'Expenses', href: '/expenses', icon: Wallet },
  { name: 'Daily Closing', href: '/closing', icon: Calculator },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ user }: { user: { name: string; role: string; email: string } }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-slate-300 no-print fixed inset-y-0 left-0 z-50">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold">
            POS
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">Cloud POS</h1>
            <p className="text-xs text-indigo-400 font-medium">Neon PostgreSQL</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
