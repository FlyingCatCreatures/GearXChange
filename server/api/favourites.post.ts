import { addFavourite } from '../lib/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserIdFromSession(event);
  if (!userId) return { error: 'Not authenticated' };
  await addFavourite(userId, body.listing_id);
  return { success: true };
});
