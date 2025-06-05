import { placeBid } from '../lib/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserIdFromSession(event);
  if (!userId) return { error: 'Not authenticated' };
  await placeBid(body.listing_id, body.amount, userId );
  return { success: true };
});
