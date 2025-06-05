import { db, sessionTable, userTable } from '~/server/lib/db';
import { eq } from 'drizzle-orm';
import { hash } from 'bcryptjs';
import { z } from 'zod/v4';
import { getUserIdFromSession } from '~/server/lib/session';

const UpdateUser = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export default defineEventHandler(async (event) => {
  // Get current user ID from session
  const userId = await getUserIdFromSession(event);
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  // Fetch the full user object using the permanent user id from session.userId
  const [session] = await db.select().from(sessionTable).where(eq(sessionTable.userId, userId)).limit(1);
  if (!session) {
    throw createError({ statusCode: 404, message: 'Session not found' });
  }
  const [user] = await db.select().from(userTable).where(eq(userTable.id, session.userId)).limit(1);
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' });
  }

  const body = await readBody<{ email?: string; password?: string }>(event);
  const res = UpdateUser.safeParse(body);
  if (!res.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' });
  }

  const updates: Record<string, any> = {};

  // Only update email if provided and different
  if (body.email && body.email !== user.email) {
    updates.email = body.email;
  }

  // Only update password if provided
  if (body.password) {
    updates.hashedPassword = await hash(body.password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return { success: true, message: 'No changes made.' };
  }

  await db.update(userTable).set(updates).where(eq(userTable.id, user.id));
  return { success: true };
});
