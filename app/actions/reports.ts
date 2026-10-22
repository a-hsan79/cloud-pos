'use server';

import { db } from '@/db';
import { sales, expenses, customers, products, dailyClosings, customerPayments } from '@/db/schema';
import { eq, sql, desc, gte, lte, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todaySalesRes = await db.select({
    totalSales: sql<number>`sum(CAST(${sales.subtotal} AS NUMERIC))`,
    totalDiscount: sql<number>`sum(CAST(${sales.discount} AS NUMERIC))`,
    netSales: sql<number>`sum(CAST(${sales.grandTotal} AS NUMERIC))`,
    paymentsReceived: sql<number>`sum(CAST(${sales.amountPaid} AS NUMERIC))`,
    txCount: sql<number>`count(*)`,
  })
  .from(sales)
  .where(gte(sales.createdAt, todayStart));

  const stats = todaySalesRes[0] || { totalSales: 0, totalDiscount: 0, netSales: 0, paymentsReceived: 0, txCount: 0 };

  const todayExpensesRes = await db.select({
    totalExpenses: sql<number>`sum(CAST(${expenses.amount} AS NUMERIC))`,
  })
  .from(expenses)
  .where(gte(expenses.createdAt, todayStart));

  const totalExpenses = Number(todayExpensesRes[0]?.totalExpenses || 0);

  const custBalRes = await db.select({
    totalBalance: sql<number>`sum(CAST(${customers.currentBalance} AS NUMERIC))`,
  }).from(customers);

  const totalCustomerBalance = Number(custBalRes[0]?.totalBalance || 0);

  const allProds = await db.select().from(products).where(eq(products.isActive, true));
  const lowStockProducts = allProds.filter(p => Number(p.stockQuantity) <= Number(p.minStockThreshold));

  const recentSales = await db.select({
    id: sales.id,
    invoiceNumber: sales.invoiceNumber,
    grandTotal: sales.grandTotal,
    status: sales.status,
    createdAt: sales.createdAt,
    customerName: customers.name,
  })
  .from(sales)
  .leftJoin(customers, eq(sales.customerId, customers.id))
  .orderBy(desc(sales.createdAt))
  .limit(5);

  return {
    todaySales: Number(stats.netSales || 0),
    todayGross: Number(stats.totalSales || 0),
    todayDiscount: Number(stats.totalDiscount || 0),
    todayPayments: Number(stats.paymentsReceived || 0),
    todayExpenses: totalExpenses,
    netProfitOrSales: Number(stats.netSales || 0) - totalExpenses,
    transactionCount: Number(stats.txCount || 0),
    totalCustomerBalance,
    lowStockCount: lowStockProducts.length,
    lowStockProducts,
    recentSales,
  };
}

export async function getDailyClosingData(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59`);

  const salesRes = await db.select({
    totalSales: sql<number>`sum(CAST(${sales.subtotal} AS NUMERIC))`,
    totalDiscount: sql<number>`sum(CAST(${sales.discount} AS NUMERIC))`,
    netSales: sql<number>`sum(CAST(${sales.grandTotal} AS NUMERIC))`,
    amountPaid: sql<number>`sum(CAST(${sales.amountPaid} AS NUMERIC))`,
  })
  .from(sales)
  .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));

  const paymentsRes = await db.select({
    totalPayments: sql<number>`sum(CAST(${customerPayments.amount} AS NUMERIC))`,
  })
  .from(customerPayments)
  .where(and(gte(customerPayments.createdAt, start), lte(customerPayments.createdAt, end)));

  const expensesRes = await db.select({
    totalExpenses: sql<number>`sum(CAST(${expenses.amount} AS NUMERIC))`,
  })
  .from(expenses)
  .where(and(gte(expenses.createdAt, start), lte(expenses.createdAt, end)));

  const existingClosing = await db.select().from(dailyClosings).where(eq(dailyClosings.closingDate, dateStr));

  return {
    date: dateStr,
    sales: salesRes[0] || { totalSales: 0, totalDiscount: 0, netSales: 0, amountPaid: 0 },
    customerPayments: Number(paymentsRes[0]?.totalPayments || 0),
    expenses: Number(expensesRes[0]?.totalExpenses || 0),
    existingClosing: existingClosing[0] || null,
  };
}

export async function saveDailyClosing(data: {
  date: string;
  totalSales: number;
  totalDiscounts: number;
  totalPayments: number;
  totalExpenses: number;
  expectedCash: number;
  actualCash: number;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');

  const difference = data.actualCash - data.expectedCash;

  const existing = await db.select().from(dailyClosings).where(eq(dailyClosings.closingDate, data.date));

  if (existing.length > 0) {
    await db.update(dailyClosings).set({
      totalSales: data.totalSales.toFixed(2),
      totalDiscounts: data.totalDiscounts.toFixed(2),
      totalPayments: data.totalPayments.toFixed(2),
      totalExpenses: data.totalExpenses.toFixed(2),
      expectedCash: data.expectedCash.toFixed(2),
      actualCash: data.actualCash.toFixed(2),
      difference: difference.toFixed(2),
      notes: data.notes,
      closedByUserId: user.userId,
    }).where(eq(dailyClosings.closingDate, data.date));
  } else {
    await db.insert(dailyClosings).values({
      closingDate: data.date,
      totalSales: data.totalSales.toFixed(2),
      totalDiscounts: data.totalDiscounts.toFixed(2),
      totalPayments: data.totalPayments.toFixed(2),
      totalExpenses: data.totalExpenses.toFixed(2),
      expectedCash: data.expectedCash.toFixed(2),
      actualCash: data.actualCash.toFixed(2),
      difference: difference.toFixed(2),
      notes: data.notes,
      closedByUserId: user.userId,
    });
  }

  revalidatePath('/closing');
  revalidatePath('/reports');
}
