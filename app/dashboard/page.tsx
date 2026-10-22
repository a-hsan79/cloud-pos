import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { getDashboardStats } from '@/app/actions/reports';
import {
  DollarSign,
  CreditCard,
  Users,
  Wallet,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const stats = await getDashboardStats();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={user} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Dashboard & Analytics</h1>
          <div className="text-sm font-medium text-slate-600">
            Welcome back, <span className="text-indigo-600 font-semibold">{user.name}</span>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Net Sales</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Rs. {stats.todaySales.toLocaleString()}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Gross: Rs. {stats.todayGross.toLocaleString()} | Disc: Rs. {stats.todayDiscount.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Payments Received</p>
                  <h3 className="mt-2 text-2xl font-bold text-emerald-600">Rs. {stats.todayPayments.toLocaleString()}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CreditCard className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Transactions: <span className="font-semibold text-slate-700">{stats.transactionCount}</span>
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Balances</p>
                  <h3 className="mt-2 text-2xl font-bold text-amber-600">Rs. {stats.totalCustomerBalance.toLocaleString()}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">Total outstanding credit</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Expenses</p>
                  <h3 className="mt-2 text-2xl font-bold text-red-600">Rs. {stats.todayExpenses.toLocaleString()}</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Net after expenses: <span className="font-semibold text-slate-700">Rs. {stats.netProfitOrSales.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">Low Stock Products</h2>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  {stats.lowStockCount} items
                </span>
              </div>

              {stats.lowStockProducts.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">All product stock levels are healthy.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">SKU</th>
                        <th className="py-3 px-4">Current Stock</th>
                        <th className="py-3 px-4">Threshold</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.lowStockProducts.map(prod => (
                        <tr key={prod.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-900">{prod.name}</td>
                          <td className="py-3 px-4 text-xs font-mono">{prod.sku}</td>
                          <td className="py-3 px-4 font-bold text-red-600">{Number(prod.stockQuantity)} {prod.baseUnit}</td>
                          <td className="py-3 px-4">{Number(prod.minStockThreshold)} {prod.baseUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Receipt className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Recent Sales</h2>
                </div>
                <a href="/sales" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                  View All →
                </a>
              </div>

              {stats.recentSales.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No sales recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Invoice</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.recentSales.map(sale => (
                        <tr key={sale.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-semibold text-indigo-600">{sale.invoiceNumber}</td>
                          <td className="py-3 px-4">{sale.customerName || 'Walk-in Customer'}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">Rs. {Number(sale.grandTotal).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                              sale.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                              sale.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
