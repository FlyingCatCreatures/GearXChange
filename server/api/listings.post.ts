import { createListing } from '../utils/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserIdFromSession(event);
  if (!userId) return { error: 'Not authenticated' };
  await createListing({ ...body, user_id: userId });
  return { success: true };
});
