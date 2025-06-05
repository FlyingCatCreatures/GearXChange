import { incrementListingViews } from '../lib/listings';
// import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { listing_id } = body;

  if (!listing_id) {
    throw createError({ statusCode: 400, message: 'Missing listing_id' });
  }

  await incrementListingViews(listing_id);

  return { success: true };
});
