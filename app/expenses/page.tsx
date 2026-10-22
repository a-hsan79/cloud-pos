'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getExpenses, createExpense } from '@/app/actions/expenses';
import { Plus } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState('Utilities');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    const list = await getExpenses();
    setExpenses(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense({
        category,
        description,
        amount: Number(amount),
        paymentMethod,
        notes,
      });
      setDescription('');
      setAmount('');
      setNotes('');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Store Expenses Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Record Expense</span>
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-4 px-6">Category / Description</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenses.map(ex => (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{ex.category}</p>
                      <p className="text-xs text-slate-500">{ex.description}</p>
                    </td>
                    <td className="py-4 px-6 font-bold text-red-600">Rs. {Number(ex.amount).toLocaleString()}</td>
                    <td className="py-4 px-6 uppercase text-xs font-semibold">{ex.paymentMethod}</td>
                    <td className="py-4 px-6 text-xs text-slate-500">{new Date(ex.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Record New Expense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities (Electricity, Water, Gas)</option>
                    <option value="Salaries">Staff Salaries</option>
                    <option value="Supplies">Store Supplies</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Amount (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
