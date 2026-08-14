'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Server actions for the Settings page.
 *
 * These exist so Settings never needs `next-auth/react`. This app has no
 * <SessionProvider> (it was removed in commit cf2bf3a when sign-in moved to a
 * Server Action), so calling useSession()/signOut() from the client throws and
 * blanks the page. Everything here runs on the server instead.
 */

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}

export async function updatePreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // Unchecked checkboxes are simply absent from FormData.
  const isPublic = formData.get('isPublic') === 'on';
  const emailChronicle = formData.get('emailChronicle') === 'on';

  await prisma.user.update({
    where: { id: session.user.id },
    data: { isPublic, emailChronicle },
  });

  revalidatePath('/dashboard/settings');
}

export async function regenerateWebhookToken() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  // 32 random bytes, hex encoded. Node's webcrypto is available in the Node runtime.
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  await prisma.user.update({
    where: { id: session.user.id },
    data: { webhookToken: token },
  });

  revalidatePath('/dashboard/settings');
}
