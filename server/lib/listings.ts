import { db, machineryListingsTable, favouriteListingsTable } from './db';
import { eq, desc, asc, and } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';

export async function createListing(listing: Omit<InferSelectModel<typeof machineryListingsTable>, "id" | "views" | "created_at">) {
  await db.insert(machineryListingsTable).values(listing);
}

export async function getListings(ordering: string = "views_desc") {
  let orderBy;
  if (ordering === "price_asc") orderBy = asc(machineryListingsTable.price);
  else if (ordering === "price_desc") orderBy = desc(machineryListingsTable.price);
  else if (ordering === "date_desc") orderBy = desc(machineryListingsTable.created_at);
  else orderBy = desc(machineryListingsTable.views);
  return await db.select().from(machineryListingsTable).orderBy(orderBy);
}

export async function addFavourite(user_id: number, listing_id: number) {
  await db.insert(favouriteListingsTable).values({ user_id, listing_id });
}

export async function removeFavourite(user_id: number, listing_id: number) {
  await db.delete(favouriteListingsTable).where(
    and(
      eq(favouriteListingsTable.user_id, user_id),
      eq(favouriteListingsTable.listing_id, listing_id)
    )
  );
}

export async function getFavouriteListings(user_id: number) {
  // Join favourite_listings with machinery_listings
  return await db
    .select()
    .from(favouriteListingsTable)
    .leftJoin(machineryListingsTable, eq(favouriteListingsTable.listing_id, machineryListingsTable.id))
    .where(eq(favouriteListingsTable.user_id, user_id));
}
