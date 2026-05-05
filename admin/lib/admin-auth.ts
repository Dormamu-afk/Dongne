import { cookies } from 'next/headers';
import { createHmac } from 'crypto';

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value;
  if (!session || !process.env.ADMIN_PASSWORD) return false;
  const expected = createHmac('sha256', process.env.ADMIN_PASSWORD).update('session').digest('hex');
  return session === expected;
}
