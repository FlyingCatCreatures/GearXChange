import { removeFavourite } from '../utils/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const userId = await getUserIdFromSession(event);
  if (!userId) return { error: 'Not authenticated' };
  const { listing_id } = await readBody(event);
  await removeFavourite(userId, listing_id);
  return { success: true };
});
