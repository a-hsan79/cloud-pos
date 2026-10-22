'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { ShoppingCart, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
            <ShoppingCart className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Cloud POS Login</h2>
          <p className="mt-2 text-sm text-slate-600">
            Secure Cloud-Based Point of Sale System
          </p>
          <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200">
            Default Admin: <span className="font-semibold">admin@pos.com</span> / <span className="font-semibold">admin123</span>
          </div>
        </div>

        {state?.error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {state.error}
          </div>
        )}

        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue="admin@pos.com"
                  className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  placeholder="admin@pos.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  defaultValue="admin123"
                  className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <ArrowRight className="h-5 w-5 text-indigo-300 group-hover:text-indigo-200" />
              </span>
              {isPending ? 'Signing in...' : 'Sign in to Cloud POS'}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-slate-500 border-t pt-4">
          All transactions are securely persisted in Cloud PostgreSQL. No local business data storage.
        </div>
      </div>
    </div>
  );
}
