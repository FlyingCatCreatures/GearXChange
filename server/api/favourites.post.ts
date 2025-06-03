import { addFavourite } from '../lib/listings';
import { getUserIdFromSession } from '../lib/session';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = await getUserIdFromSession(event);

  if (userId == null) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    });
  } else {
    await addFavourite(userId, body.listing_id);
    return { success: true };
  }
});