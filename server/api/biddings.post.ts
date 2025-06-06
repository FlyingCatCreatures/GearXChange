import { placeBid } from "../utils/listings";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const userId = event.context.user?.id;
  if (!userId) return { error: "You must be logged in to place a bid" };
  await placeBid(body.listing_id, body.amount, userId);
  return { success: true };
});
