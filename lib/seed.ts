import { db } from '@/db';
import { users, businessSettings, categories } from '@/db/schema';
import { hashPassword } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function seedInitialData() {
  try {
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@pos.com')).limit(1);
    if (existingAdmin.length === 0) {
      const passwordHash = await hashPassword('admin123');
      await db.insert(users).values({
        name: 'Super Admin',
        email: 'admin@pos.com',
        passwordHash,
        role: 'admin',
      });
    }

    const settings = await db.select().from(businessSettings).limit(1);
    if (settings.length === 0) {
      await db.insert(businessSettings).values({
        businessName: 'Cloud POS Store',
        tagline: 'Retail & Wholesale Management',
        address: 'Main Commercial Avenue, City',
        phone: '+92 300 9876543',
        currency: 'Rs.',
        taxRate: '0.00',
        receiptFooter: 'Thank you for your visit! No return without original receipt.',
      });
    }

    const cats = await db.select().from(categories).limit(1);
    if (cats.length === 0) {
      await db.insert(categories).values([
        { name: 'General Grocery', description: 'Daily grocery items' },
        { name: 'Beverages', description: 'Drinks, juices, water' },
        { name: 'Grains & Flour', description: 'Rice, wheat, flour in bags/kg' },
      ]);
    }
  } catch (error) {
    console.error('Seed error or DB not ready yet:', error);
  }
}
