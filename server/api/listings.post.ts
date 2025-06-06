import { createListing } from '../utils/listings';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = event.context.user?.id
  if (!userId) return { error: 'Not authenticated' };
  await createListing({ ...body, user_id: userId });
  return { success: true };
});
