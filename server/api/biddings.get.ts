import { getBiddings } from '../lib/listings';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const listing_id = query.listing_id as string | '';
  return await getBiddings(listing_id);
});
