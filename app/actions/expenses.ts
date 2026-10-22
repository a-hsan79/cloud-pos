'use server';

import { db } from '@/db';
import { expenses } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getExpenses() {
  return db.select().from(expenses).orderBy(desc(expenses.createdAt));
}

export async function createExpense(data: {
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  if (data.amount <= 0) throw new Error('Invalid expense amount');

  await db.insert(expenses).values({
    category: data.category,
    description: data.description,
    amount: data.amount.toFixed(2),
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    userId: user.userId,
  });

  revalidatePath('/expenses');
  revalidatePath('/dashboard');
  revalidatePath('/closing');
}
