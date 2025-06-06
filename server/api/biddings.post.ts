import { placeBid } from '../utils/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserIdFromSession(event);
  if (!userId) return { error: 'You must be logged in to place a bid' };
  await placeBid(body.listing_id, body.amount, userId );
  return { success: true };
});
