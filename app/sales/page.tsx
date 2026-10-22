'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getSalesHistory, getSaleDetails } from '@/app/actions/sales';
import { Printer, Eye, X } from 'lucide-react';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const history = await getSalesHistory();
      setSales(history);
    }
    load();
  }, []);

  const openDetails = async (saleId: number) => {
    const details = await getSaleDetails(saleId);
    setSelectedSale(details);
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm no-print">
          <h1 className="text-xl font-bold text-slate-900">Sales History & Invoices</h1>
        </header>

        <div className="p-8 space-y-6 no-print">
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-4 px-6">Invoice Number</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Grand Total</th>
                  <th className="py-4 px-6">Paid / Balance</th>
                  <th className="py-4 px-6">Method / Status</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-600">{s.invoiceNumber}</td>
                    <td className="py-4 px-6">{s.customerName || 'Walk-in Customer'}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">Rs. {Number(s.grandTotal).toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <p className="text-emerald-600">Paid: Rs. {Number(s.amountPaid).toLocaleString()}</p>
                      <p className="text-amber-600">Bal: Rs. {Number(s.remainingBalance).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="uppercase text-xs font-semibold">{s.paymentMethod}</p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                        s.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'partial' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openDetails(s.id)}
                        className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-center no-print border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">Invoice Details: {selectedSale.sale.invoiceNumber}</h2>
                <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-800">
                <div className="text-center space-y-1 border-b pb-4">
                  <h3 className="text-2xl font-extrabold text-slate-900">Cloud POS Store</h3>
                  <p className="text-xs text-slate-500">Retail & Wholesale Management System</p>
                  <p className="text-xs text-slate-500">Phone: +92 300 9876543 | City, Pakistan</p>
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-700">Invoice: <span className="font-mono text-indigo-600">{selectedSale.sale.invoiceNumber}</span></p>
                    <p>Date: {new Date(selectedSale.sale.createdAt).toLocaleString()}</p>
                    <p>Cashier: {selectedSale.sale.userName || 'Admin'}</p>
                  </div>
                  <div className="text-right">
                    {selectedSale.sale.customerName ? (
                      <div>
                        <p className="font-semibold text-slate-700">Dear, {selectedSale.sale.customerName}</p>
                        <p>{selectedSale.sale.customerPhone}</p>
                        <p>{selectedSale.sale.customerAddress}</p>
                      </div>
                    ) : (
                      <p className="font-semibold text-slate-700">Walk-in Customer</p>
                    )}
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 uppercase">
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3">Qty</th>
                      <th className="py-2 px-3">Price</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedSale.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 font-semibold">{item.productName} ({item.sku})</td>
                        <td className="py-2.5 px-3">{Number(item.quantity)} {item.unit}</td>
                        <td className="py-2.5 px-3">Rs. {Number(item.unitPrice).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">Rs. {Number(item.lineTotal).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t pt-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rs. {Number(selectedSale.sale.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>Rs. {Number(selectedSale.sale.discount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t pt-2">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">Rs. {Number(selectedSale.sale.grandTotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Amount Paid ({selectedSale.sale.paymentMethod.toUpperCase()})</span>
                    <span>Rs. {Number(selectedSale.sale.amountPaid).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-600 font-semibold">
                    <span>Remaining Balance</span>
                    <span>Rs. {Number(selectedSale.sale.remainingBalance).toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-center text-xs text-slate-500 border-t pt-4">
                  <p>Thank you for your business! Goods once sold cannot be returned without receipt.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t no-print">
                <button
                  onClick={() => setSelectedSale(null)}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Invoice / Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
