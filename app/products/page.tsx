'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getProducts, getCategories, saveProduct, createCategory } from '@/app/actions/products';
import { Plus, Search, Edit2, Tag } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [baseUnit, setBaseUnit] = useState('pcs');
  const [packageSize, setPackageSize] = useState('1');
  const [packageUnit, setPackageUnit] = useState('bag');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [notes, setNotes] = useState('');

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadData = async () => {
    const prods = await getProducts(search);
    const cats = await getCategories();
    setProducts(prods);
    setCategories(cats);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('SKU-' + Math.floor(1000 + Math.random() * 9000));
    setBarcode('');
    setCategoryId('');
    setPurchaseCost('');
    setSellingPrice('');
    setStockQuantity('');
    setBaseUnit('pcs');
    setPackageSize('1');
    setPackageUnit('bag');
    setMinStockThreshold('5');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setBarcode(p.barcode || '');
    setCategoryId(p.categoryId ? String(p.categoryId) : '');
    setPurchaseCost(p.purchaseCost);
    setSellingPrice(p.sellingPrice);
    setStockQuantity(p.stockQuantity);
    setBaseUnit(p.baseUnit);
    setPackageSize(p.packageSize || '1');
    setPackageUnit(p.packageUnit || 'bag');
    setMinStockThreshold(p.minStockThreshold || '5');
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProduct({
        id: editingProduct?.id,
        name,
        sku,
        barcode,
        categoryId: categoryId ? Number(categoryId) : undefined,
        purchaseCost,
        sellingPrice,
        stockQuantity,
        baseUnit,
        packageSize,
        packageUnit,
        minStockThreshold,
        notes,
      });
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCatName, newCatDesc);
      setNewCatName('');
      setNewCatDesc('');
      setShowCategoryModal(false);
      loadData();
    } catch (err: any) {
      alert('Error creating category: ' + err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar user={{ name: 'Admin', role: 'admin', email: 'admin@pos.com' }} />
      <main className="flex-1 pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Products & Inventory Management</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center space-x-2 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
            >
              <Tag className="h-4 w-4" />
              <span>Add Category</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b">
                <tr>
                  <th className="py-4 px-6">Product / SKU</th>
                  <th className="py-4 px-6">Cost / Price</th>
                  <th className="py-4 px-6">Stock Level</th>
                  <th className="py-4 px-6">Base Unit / Pkg</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      <p className="text-xs font-mono text-slate-500">{p.sku} {p.barcode ? `| Barcode: ${p.barcode}` : ''}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-900 font-semibold">Rs. {Number(p.sellingPrice).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Cost: Rs. {Number(p.purchaseCost).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${Number(p.stockQuantity) <= Number(p.minStockThreshold) ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Number(p.stockQuantity)} {p.baseUnit}
                      </span>
                      <p className="text-xs text-slate-500">Min: {Number(p.minStockThreshold)}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-900 capitalize">{p.baseUnit}</p>
                      <p className="text-xs text-slate-500">Pkg: {Number(p.packageSize)} {p.baseUnit}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openEditModal(p)}
                        className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Barcode (Optional)</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Purchase Cost (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={purchaseCost}
                      onChange={(e) => setPurchaseCost(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Selling Price (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold text-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Base Unit</label>
                    <select
                      value={baseUnit}
                      onChange={(e) => setBaseUnit(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="grams">Grams</option>
                      <option value="meters">Meters</option>
                      <option value="liters">Liters</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Min Threshold</label>
                    <input
                      type="number"
                      step="0.001"
                      required
                      value={minStockThreshold}
                      onChange={(e) => setMinStockThreshold(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Package Size (e.g. 10 kg bag)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={packageSize}
                      onChange={(e) => setPackageSize(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Notes / Description</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                    />
                  </div>
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
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add Product Category</h2>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow"
                  >
                    Add Category
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
