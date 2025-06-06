import { deleteListing } from "../utils/listings";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = event.context.user?.id;
  if (!userId) return { error: "Not authenticated" };
  const { listing_id } = body;
  if (!listing_id) return { error: "Missing listing_id" };
  const result = await deleteListing(listing_id, userId);
  if (result?.error) return { error: result.error };
  return { success: true };
});
