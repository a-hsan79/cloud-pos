'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getProducts } from '@/app/actions/products';
import { getCustomers } from '@/app/actions/customers';
import { createSale } from '@/app/actions/sales';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Printer, CheckCircle2 } from 'lucide-react';

export default function POSPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [overallDiscount, setOverallDiscount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const p = await getProducts();
      const c = await getCustomers();
      setProducts(p);
      setCustomers(c);
    }
    loadData();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchQuery))
  );

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        sellingPrice: Number(product.sellingPrice),
        quantity: 1,
        unit: product.baseUnit,
        packageSize: Number(product.packageSize || 1),
        discount: 0,
      }]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(0.1, item.quantity + delta);
        return { ...item, quantity: Number(newQty.toFixed(3)) };
      }
      return item;
    }));
  };

  const updateItemUnit = (productId: number, unit: string) => {
    setCart(cart.map(item => item.productId === productId ? { ...item, unit } : item));
  };

  const removeItem = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.sellingPrice) - item.discount, 0);
  const grandTotal = Math.max(0, subtotal - overallDiscount);

  useEffect(() => {
    setAmountPaid(grandTotal);
  }, [grandTotal]);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    setLoading(true);
    try {
      const res = await createSale({
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.sellingPrice,
          discount: item.discount,
          packageSize: item.packageSize,
        })),
        discount: overallDiscount,
        amountPaid: Number(amountPaid),
        paymentMethod,
        notes,
      });

      if (res.success) {
        setSuccessResult(res);
        setCart([]);
        setOverallDiscount(0);
        setNotes('');
        const p = await getProducts();
        setProducts(p);
      }
    } catch (err: any) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Cashier / Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64 flex flex-col h-screen overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm no-print">
          <h1 className="text-xl font-bold text-slate-900">POS Checkout Terminal</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Walk-in Customer (General)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No phone'})</option>
              ))}
            </select>
          </div>
        </header>

        {successResult ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-white">
            <div className="max-w-md w-full rounded-2xl bg-slate-50 p-8 border border-slate-200 text-center space-y-6 shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Sale Completed Successfully!</h2>
              <p className="text-sm text-slate-600">
                Invoice Number: <span className="font-mono font-bold text-indigo-600">{successResult.invoiceNumber}</span>
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center space-x-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSuccessResult(null)}
                  className="flex-1 rounded-lg bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  New Sale
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search products by name, SKU or barcode (USB scanner supported)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col justify-between rounded-xl bg-white p-4 border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all text-left"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-500">{product.sku}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          Number(product.stockQuantity) > Number(product.minStockThreshold)
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          Stock: {Number(product.stockQuantity)} {product.baseUnit}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="mt-4 pt-2 border-t flex justify-between items-center">
                      <span className="text-base font-bold text-indigo-600">Rs. {Number(product.sellingPrice).toLocaleString()}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Unit: {product.baseUnit}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-96 flex flex-col bg-white border-l border-slate-200 shadow-xl">
              <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900">Current Cart</h2>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {cart.length} items
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y">
                {cart.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-400">Cart is empty. Select products to begin sale.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.productId} className="pt-4 first:pt-0">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-slate-900 text-sm">{item.name}</span>
                        <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mb-2 text-xs text-slate-600">
                        <span>Price: Rs. {item.sellingPrice}</span>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItemUnit(item.productId, e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs"
                        >
                          <option value={item.unit}>{item.unit} (Base)</option>
                          <option value="bag">Bag / Pkg ({item.packageSize} {item.unit})</option>
                          <option value="grams">Grams</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 border rounded-lg bg-slate-50 p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-700"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-12 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-700"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          Rs. {((item.quantity * item.sellingPrice) - item.discount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 border-t bg-slate-50 space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-600">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={overallDiscount}
                    onChange={(e) => setOverallDiscount(Number(e.target.value))}
                    className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm"
                  />
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">Rs. {grandTotal.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-900"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="credit">Store Credit / Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Received</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full rounded border border-slate-300 px-2 py-1.5 text-right text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 shadow-md disabled:opacity-50 transition-all mt-2"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>{loading ? 'Processing...' : `Complete Sale (Rs. ${grandTotal.toLocaleString()})`}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
