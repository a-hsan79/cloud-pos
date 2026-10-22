import { pgTable, serial, text, timestamp, numeric, integer, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('cashier'), // 'admin', 'manager', 'cashier'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const businessSettings = pgTable('business_settings', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull().default('My Cloud POS'),
  tagline: text('tagline').default('Retail & Wholesale Store'),
  address: text('address').default('Main Market, City'),
  phone: text('phone').default('+92 300 1234567'),
  currency: text('currency').notNull().default('Rs.'),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0.00'),
  receiptFooter: text('receipt_footer').default('Thank you for your business! Goods once sold cannot be returned without receipt.'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode'),
  categoryId: integer('category_id').references(() => categories.id),
  purchaseCost: decimal('purchase_cost', { precision: 12, scale: 2 }).notNull().default('0.00'),
  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull().default('0.00'),
  stockQuantity: decimal('stock_quantity', { precision: 12, scale: 3 }).notNull().default('0.000'), // base unit quantity
  baseUnit: text('base_unit').notNull().default('pcs'), // 'pcs', 'kg', 'grams', 'meters'
  packageSize: decimal('package_size', { precision: 12, scale: 3 }).default('1.000'), // e.g. 10 for 10kg bag
  packageUnit: text('package_unit').default('bag'), // 'bag', 'box', 'carton'
  minStockThreshold: decimal('min_stock_threshold', { precision: 12, scale: 3 }).default('5.000'),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  address: text('address'),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }).default('0.00'),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0.00'), // positive means customer owes us
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  userId: integer('user_id').references(() => users.id),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 12, scale: 2 }).notNull().default('0.00'),
  tax: decimal('tax', { precision: 12, scale: 2 }).notNull().default('0.00'),
  grandTotal: decimal('grand_total', { precision: 12, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 12, scale: 2 }).notNull().default('0.00'),
  remainingBalance: decimal('remaining_balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  paymentMethod: text('payment_method').notNull().default('cash'), // 'cash', 'card', 'bank', 'credit'
  status: text('status').notNull().default('paid'), // 'paid', 'partial', 'unpaid'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const saleItems = pgTable('sale_items', {
  id: serial('id').primaryKey(),
  saleId: integer('sale_id').references(() => sales.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 12, scale: 3 }).notNull(),
  unit: text('unit').notNull().default('pcs'), // 'pcs', 'kg', 'grams', 'bag', etc.
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 12, scale: 2 }).default('0.00'),
  lineTotal: decimal('line_total', { precision: 12, scale: 2 }).notNull(),
});

export const customerPayments = pgTable('customer_payments', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  saleId: integer('sale_id').references(() => sales.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull().default('cash'),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(), // 'Rent', 'Utilities', 'Salaries', 'Supplies', 'Other'
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull().default('cash'),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const dailyClosings = pgTable('daily_closings', {
  id: serial('id').primaryKey(),
  closingDate: text('closing_date').notNull().unique(), // YYYY-MM-DD
  totalSales: decimal('total_sales', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalDiscounts: decimal('total_discounts', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalPayments: decimal('total_payments', { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalExpenses: decimal('total_expenses', { precision: 12, scale: 2 }).notNull().default('0.00'),
  expectedCash: decimal('expected_cash', { precision: 12, scale: 2 }).notNull().default('0.00'),
  actualCash: decimal('actual_cash', { precision: 12, scale: 2 }).notNull().default('0.00'),
  difference: decimal('difference', { precision: 12, scale: 2 }).notNull().default('0.00'),
  notes: text('notes'),
  closedByUserId: integer('closed_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stockMovements = pgTable('stock_movements', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // 'sale', 'purchase', 'adjustment', 'return'
  quantity: decimal('quantity', { precision: 12, scale: 3 }).notNull(), // positive or negative
  referenceId: text('reference_id'), // invoice number or purchase ref
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
