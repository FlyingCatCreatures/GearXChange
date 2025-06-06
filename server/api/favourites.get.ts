import { getFavouriteListings } from '../utils/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const userId = await getUserIdFromSession(event);
  if (!userId) return [];
  return await getFavouriteListings(userId);
});
