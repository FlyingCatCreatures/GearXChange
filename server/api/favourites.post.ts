export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = event.context.user?.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    });
  } else {
    console.log(userId, body.listing_id)
    console.log(body)
    await addFavourite(userId, body.listing_id);
    return { success: true };
  }
});