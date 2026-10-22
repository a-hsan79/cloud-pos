'use server';

import { db } from '@/db';
import { sales, saleItems, products, customers, customerPayments, stockMovements, users } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createSale(cartData: {
  customerId?: number | null;
  items: Array<{
    productId: number;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount: number;
    packageSize?: number;
  }>;
  discount: number;
  amountPaid: number;
  paymentMethod: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (!cartData.items || cartData.items.length === 0) {
    throw new Error('Cart is empty');
  }

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const countRes = await db.select({ count: sql<number>`count(*)` }).from(sales);
  const seq = Number(countRes[0]?.count || 0) + 1;
  const invoiceNumber = `INV-${todayStr}-${String(seq).padStart(4, '0')}`;

  let subtotal = 0;
  const processedItems = cartData.items.map(item => {
    let baseQuantityQty = item.quantity;
    if (item.unit === 'bag' || item.unit === 'package' || item.unit === 'box') {
      baseQuantityQty = item.quantity * (item.packageSize || 1);
    } else if (item.unit === 'grams') {
      baseQuantityQty = item.quantity / 1000;
    }

    const lineTotal = (item.quantity * item.unitPrice) - item.discount;
    subtotal += lineTotal;
    return {
      ...item,
      baseQuantityQty,
      lineTotal,
    };
  });

  const discount = cartData.discount || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const amountPaid = cartData.amountPaid || 0;
  const remainingBalance = Math.max(0, grandTotal - amountPaid);

  let status = 'paid';
  if (amountPaid === 0) status = 'unpaid';
  else if (amountPaid < grandTotal) status = 'partial';

  const result = await db.transaction(async (tx) => {
    const [newSale] = await tx.insert(sales).values({
      invoiceNumber,
      customerId: cartData.customerId ? Number(cartData.customerId) : null,
      userId: user.userId,
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      amountPaid: amountPaid.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2),
      paymentMethod: cartData.paymentMethod,
      status,
      notes: cartData.notes,
    }).returning();

    for (const item of processedItems) {
      await tx.insert(saleItems).values({
        saleId: newSale.id,
        productId: item.productId,
        quantity: item.quantity.toString(),
        unit: item.unit,
        unitPrice: item.unitPrice.toString(),
        discount: item.discount.toString(),
        lineTotal: item.lineTotal.toFixed(2),
      });

      const [prod] = await tx.select().from(products).where(eq(products.id, item.productId));
      if (!prod) throw new Error(`Product ID ${item.productId} not found`);

      const currentStock = Number(prod.stockQuantity);
      const newStock = currentStock - item.baseQuantityQty;

      await tx.update(products).set({
        stockQuantity: newStock.toFixed(3),
        updatedAt: new Date(),
      }).where(eq(products.id, item.productId));

      await tx.insert(stockMovements).values({
        productId: item.productId,
        type: 'sale',
        quantity: (-item.baseQuantityQty).toFixed(3),
        referenceId: invoiceNumber,
        notes: `Sale invoice ${invoiceNumber}`,
        userId: user.userId,
      });
    }

    if (cartData.customerId) {
      const custId = Number(cartData.customerId);
      const [cust] = await tx.select().from(customers).where(eq(customers.id, custId));
      if (cust) {
        const currentBal = Number(cust.currentBalance);
        const newBal = currentBal + remainingBalance;

        await tx.update(customers).set({
          currentBalance: newBal.toFixed(2),
          updatedAt: new Date(),
        }).where(eq(customers.id, custId));

        if (amountPaid > 0) {
          await tx.insert(customerPayments).values({
            customerId: custId,
            saleId: newSale.id,
            amount: amountPaid.toFixed(2),
            paymentMethod: cartData.paymentMethod,
            notes: `Payment received during sale ${invoiceNumber}`,
            userId: user.userId,
          });
        }
      }
    }

    return newSale;
  });

  revalidatePath('/dashboard');
  revalidatePath('/sales');
  revalidatePath('/pos');
  revalidatePath('/products');
  revalidatePath('/customers');

  return { success: true, saleId: result.id, invoiceNumber };
}

export async function getSalesHistory() {
  return db.select({
    id: sales.id,
    invoiceNumber: sales.invoiceNumber,
    grandTotal: sales.grandTotal,
    amountPaid: sales.amountPaid,
    remainingBalance: sales.remainingBalance,
    paymentMethod: sales.paymentMethod,
    status: sales.status,
    createdAt: sales.createdAt,
    customerName: customers.name,
    userName: users.name,
  })
  .from(sales)
  .leftJoin(customers, eq(sales.customerId, customers.id))
  .leftJoin(users, eq(sales.userId, users.id))
  .orderBy(desc(sales.createdAt));
}

export async function getSaleDetails(saleId: number) {
  const [sale] = await db.select({
    id: sales.id,
    invoiceNumber: sales.invoiceNumber,
    subtotal: sales.subtotal,
    discount: sales.discount,
    tax: sales.tax,
    grandTotal: sales.grandTotal,
    amountPaid: sales.amountPaid,
    remainingBalance: sales.remainingBalance,
    paymentMethod: sales.paymentMethod,
    status: sales.status,
    createdAt: sales.createdAt,
    notes: sales.notes,
    customerName: customers.name,
    customerPhone: customers.phone,
    customerAddress: customers.address,
    userName: users.name,
  })
  .from(sales)
  .leftJoin(customers, eq(sales.customerId, customers.id))
  .leftJoin(users, eq(sales.userId, users.id))
  .where(eq(sales.id, saleId));

  if (!sale) return null;

  const items = await db.select({
    id: saleItems.id,
    quantity: saleItems.quantity,
    unit: saleItems.unit,
    unitPrice: saleItems.unitPrice,
    discount: saleItems.discount,
    lineTotal: saleItems.lineTotal,
    productName: products.name,
    sku: products.sku,
  })
  .from(saleItems)
  .leftJoin(products, eq(saleItems.productId, products.id))
  .where(eq(saleItems.saleId, saleId));

  return { sale, items };
}
