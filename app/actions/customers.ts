'use server';

import { db } from '@/db';
import { customers, customerPayments } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCustomers() {
  return db.select().from(customers).orderBy(desc(customers.createdAt));
}

export async function saveCustomer(data: {
  id?: number;
  name: string;
  phone?: string;
  address?: string;
  creditLimit?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { id, ...values } = data;

  if (id) {
    await db.update(customers).set({
      name: values.name,
      phone: values.phone,
      address: values.address,
      creditLimit: values.creditLimit || '0.00',
      updatedAt: new Date(),
    }).where(eq(customers.id, id));
  } else {
    await db.insert(customers).values({
      name: values.name,
      phone: values.phone,
      address: values.address,
      creditLimit: values.creditLimit || '0.00',
      currentBalance: '0.00',
    });
  }

  revalidatePath('/customers');
  revalidatePath('/pos');
}

export async function recordCustomerPayment(data: {
  customerId: number;
  amount: number;
  paymentMethod: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (data.amount <= 0) throw new Error('Invalid payment amount');

  await db.transaction(async (tx) => {
    await tx.insert(customerPayments).values({
      customerId: data.customerId,
      amount: data.amount.toFixed(2),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      userId: user.userId,
    });

    const [cust] = await tx.select().from(customers).where(eq(customers.id, data.customerId));
    if (cust) {
      const currentBal = Number(cust.currentBalance);
      const newBal = Math.max(0, currentBal - data.amount);

      await tx.update(customers).set({
        currentBalance: newBal.toFixed(2),
        updatedAt: new Date(),
      }).where(eq(customers.id, data.customerId));
    }
  });

  revalidatePath('/customers');
  revalidatePath('/sales');
  revalidatePath('/dashboard');
}

export async function getCustomerLedger(customerId: number) {
  const [customer] = await db.select().from(customers).where(eq(customers.id, customerId));
  const payments = await db.select().from(customerPayments).where(eq(customerPayments.customerId, customerId)).orderBy(desc(customerPayments.createdAt));
  return { customer, payments };
}
