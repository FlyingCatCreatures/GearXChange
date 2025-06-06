import { removeFavourite } from "../utils/listings";

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id;
  if (!userId) return { error: "Not authenticated" };
  const { listing_id } = await readBody(event);
  await removeFavourite(userId, listing_id);
  return { success: true };
});
