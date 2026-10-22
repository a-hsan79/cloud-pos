'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { seedInitialData } from '@/lib/seed';

export async function loginAction(prevState: any, formData: FormData) {
  await seedInitialData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userList.length === 0) {
      return { error: 'Invalid email or password' };
    }

    const user = userList[0];
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);
  } catch (err: any) {
    if (err.message?.includes('NEXT_REDIRECT')) throw err;
    return { error: 'Authentication failed: ' + err.message };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
