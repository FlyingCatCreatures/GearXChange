export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = event.context.user?.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    });
  } else {
    await addFavourite(userId, body.listing_id);
    return { success: true };
  }
});