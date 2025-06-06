import { getFavouriteListings } from '../utils/listings';

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id
  if (!userId) return [];
  return await getFavouriteListings(userId);
});
