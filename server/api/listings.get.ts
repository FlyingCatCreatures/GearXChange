import { getListings } from '../utils/listings';

export default defineEventHandler(async (event) => {
  const ordering = getQuery(event).ordering as string | undefined;
  const listings = await getListings(ordering);
  return listings;
});
