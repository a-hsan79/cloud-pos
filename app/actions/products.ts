'use server';

import { db } from '@/db';
import { products, categories, stockMovements } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function createCategory(name: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  await db.insert(categories).values({ name, description });
  revalidatePath('/products');
  revalidatePath('/pos');
}

export async function getProducts(search?: string) {
  if (search) {
    return db.select().from(products)
      .where(or(like(products.name, `%${search}%`), like(products.sku, `%${search}%`), like(products.barcode, `%${search}%`)))
      .orderBy(desc(products.createdAt));
  }
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function saveProduct(data: {
  id?: number;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  purchaseCost: string;
  sellingPrice: string;
  stockQuantity: string;
  baseUnit: string;
  packageSize: string;
  packageUnit: string;
  minStockThreshold: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const { id, ...values } = data;

  if (id) {
    await db.update(products).set({
      name: values.name,
      sku: values.sku,
      barcode: values.barcode,
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      purchaseCost: values.purchaseCost,
      sellingPrice: values.sellingPrice,
      stockQuantity: values.stockQuantity,
      baseUnit: values.baseUnit,
      packageSize: values.packageSize,
      packageUnit: values.packageUnit,
      minStockThreshold: values.minStockThreshold,
      notes: values.notes,
      updatedAt: new Date(),
    }).where(eq(products.id, id));
  } else {
    const [newProd] = await db.insert(products).values({
      name: values.name,
      sku: values.sku,
      barcode: values.barcode,
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      purchaseCost: values.purchaseCost,
      sellingPrice: values.sellingPrice,
      stockQuantity: values.stockQuantity,
      baseUnit: values.baseUnit,
      packageSize: values.packageSize,
      packageUnit: values.packageUnit,
      minStockThreshold: values.minStockThreshold,
      notes: values.notes,
    }).returning();

    if (Number(values.stockQuantity) > 0) {
      await db.insert(stockMovements).values({
        productId: newProd.id,
        type: 'purchase',
        quantity: values.stockQuantity,
        referenceId: 'INITIAL-STOCK',
        notes: 'Initial inventory stock',
        userId: user.userId,
      });
    }
  }

  revalidatePath('/products');
  revalidatePath('/pos');
  revalidatePath('/dashboard');
}

export async function toggleProductStatus(id: number, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') throw new Error('Unauthorized');

  await db.update(products).set({ isActive: !isActive, updatedAt: new Date() }).where(eq(products.id, id));
  revalidatePath('/products');
}
