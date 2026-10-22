'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getCustomers, saveCustomer, recordCustomerPayment } from '@/app/actions/customers';
import { Plus, CreditCard } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('0.00');

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const loadData = async () => {
    const list = await getCustomers();
    setCustomers(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveCustomer({ name, phone, address, creditLimit });
      setName('');
      setPhone('');
      setAddress('');
      setCreditLimit('0.00');
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await recordCustomerPayment({
        customerId: selectedCustomer.id,
        amount: Number(paymentAmount),
        paymentMethod,
        notes: paymentNotes,
      });
      setPaymentAmount('');
      setPaymentNotes('');
      setShowPaymentModal(false);
      loadData();
    } catch (err: any) {
      alert('Error recording payment: ' + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Customer Accounts & Ledger</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
          >
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </header>

        <div className="p-8 space-y-6">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-4 px-6">Customer Name</th>
                  <th className="py-4 px-6">Phone / Address</th>
                  <th className="py-4 px-6">Credit Limit</th>
                  <th className="py-4 px-6">Outstanding Balance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-4 px-6">
                      <p>{c.phone || 'No phone'}</p>
                      <p className="text-xs text-slate-400">{c.address || 'No address'}</p>
                    </td>
                    <td className="py-4 px-6">Rs. {Number(c.creditLimit).toLocaleString()}</td>
                    <td className="py-4 px-6 font-bold text-amber-600">Rs. {Number(c.currentBalance).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => { setSelectedCustomer(c); setShowPaymentModal(true); }}
                        className="inline-flex items-center space-x-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Receive Payment</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Customer</h2>
              <form onSubmit={handleSaveCustomer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Credit Limit (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPaymentModal && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Receive Payment</h2>
              <p className="text-sm text-slate-600 mb-6">
                Customer: <span className="font-semibold text-slate-900">{selectedCustomer.name}</span> | Balance Owed: <span className="font-bold text-amber-600">Rs. {Number(selectedCustomer.currentBalance).toLocaleString()}</span>
              </p>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Amount (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold text-emerald-600"
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
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Notes / Reference</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow"
                  >
                    Record Payment
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
