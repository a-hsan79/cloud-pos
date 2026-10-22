'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getDailyClosingData, saveDailyClosing } from '@/app/actions/reports';
import { Calculator, CheckCircle2 } from 'lucide-react';

export default function DailyClosingPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [closingData, setClosingData] = useState<any>(null);
  const [actualCash, setActualCash] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getDailyClosingData(date);
      setClosingData(data);
      if (data.existingClosing) {
        setActualCash(Number(data.existingClosing.actualCash));
        setNotes(data.existingClosing.notes || '');
      } else {
        const expected = Number(data.sales.amountPaid || 0) + Number(data.customerPayments || 0) - Number(data.expenses || 0);
        setActualCash(expected);
      }
    }
    load();
  }, [date]);

  if (!closingData) return null;

  const expectedCash = Number(closingData.sales.amountPaid || 0) + Number(closingData.customerPayments || 0) - Number(closingData.expenses || 0);
  const difference = actualCash - expectedCash;

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await saveDailyClosing({
        date,
        totalSales: Number(closingData.sales.netSales || 0),
        totalDiscounts: Number(closingData.sales.totalDiscount || 0),
        totalPayments: Number(closingData.customerPayments || 0),
        totalExpenses: Number(closingData.expenses || 0),
        expectedCash,
        actualCash: Number(actualCash),
        notes,
      });
      alert('Daily closing successfully finalized and saved to cloud database!');
    } catch (err: any) {
      alert('Error finalizing closing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Daily Cash Closing & Reconciliation</h1>
          <div className="flex items-center space-x-3">
            <label className="text-xs font-semibold text-slate-600">Closing Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold"
            />
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-4xl mx-auto">
          {closingData.existingClosing && (
            <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center space-x-3 text-emerald-800">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Daily Closing Finalized</p>
                <p className="text-xs">This date has already been reconciled and saved by an administrator.</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-4">Reconciliation Summary for {date}</h2>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Total Gross Sales</span>
                  <span className="font-semibold text-slate-900">Rs. {Number(closingData.sales.totalSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Total Discounts</span>
                  <span className="font-semibold text-red-600">- Rs. {Number(closingData.sales.totalDiscount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Net Sales Revenue</span>
                  <span className="font-bold text-indigo-600">Rs. {Number(closingData.sales.netSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Sales Amount Paid (Cash Collected)</span>
                  <span className="font-bold text-emerald-600">Rs. {Number(closingData.sales.amountPaid || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Customer Debt Collections</span>
                  <span className="font-semibold text-emerald-600">+ Rs. {closingData.customerPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Total Expenses Paid</span>
                  <span className="font-semibold text-red-600">- Rs. {closingData.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b bg-slate-50 px-2 rounded">
                  <span className="font-bold text-slate-900">Expected Closing Cash</span>
                  <span className="font-bold text-indigo-600">Rs. {expectedCash.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Actual Physical Cash Count</label>
                  <input
                    type="number"
                    step="0.01"
                    value={actualCash}
                    onChange={(e) => setActualCash(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 p-3 text-base font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Cash Difference / Variance</label>
                  <div className={`p-3 rounded-xl font-bold text-base border ${
                    difference === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    difference > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    Rs. {difference.toLocaleString()} {difference === 0 ? '(Balanced)' : difference > 0 ? '(Surplus)' : '(Shortage)'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Closing Notes / Remarks</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm"
                  placeholder="Any explanations for cash shortage/surplus..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all"
                >
                  <Calculator className="h-5 w-5" />
                  <span>{loading ? 'Finalizing...' : 'Finalize & Save Daily Closing'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
