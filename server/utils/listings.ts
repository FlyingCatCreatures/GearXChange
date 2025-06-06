import {
  db,
  machineryListingsTable,
  favouriteListingsTable,
  biddingsTable,
  userTable,
} from "./db";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function createListing(
  listing: Omit<
    InferSelectModel<typeof machineryListingsTable>,
    "id" | "views" | "created_at"
  >,
) {
  await db.insert(machineryListingsTable).values({ id: uuidv4(), ...listing });
}

export async function getListings(ordering: string = "views_desc") {
  return await db.select().from(machineryListingsTable);
}

export async function addFavourite(user_id: string, listing_id: string) {
  await db
    .insert(favouriteListingsTable)
    .values({ id: uuidv4(), user_id, listing_id });
}

export async function removeFavourite(user_id: string, listing_id: string) {
  await db
    .delete(favouriteListingsTable)
    .where(
      and(
        eq(favouriteListingsTable.user_id, user_id),
        eq(favouriteListingsTable.listing_id, listing_id),
      ),
    );
}

export async function getFavouriteListings(user_id: string) {
  // Join favourite_listings with machinery_listings
  return await db
    .select()
    .from(favouriteListingsTable)
    .leftJoin(
      machineryListingsTable,
      eq(favouriteListingsTable.listing_id, machineryListingsTable.id),
    )
    .where(eq(favouriteListingsTable.user_id, user_id));
}

export async function incrementListingViews(listing_id: string) {
  await db
    .update(machineryListingsTable)
    .set({
      views: sql`${machineryListingsTable.views} + 1`,
    })
    .where(eq(machineryListingsTable.id, listing_id));
}

export async function placeBid(
  listing_id: string,
  amount: number,
  user_id: string,
) {
  const existing = await db
    .select()
    .from(biddingsTable)
    .where(
      and(
        eq(biddingsTable.user_id, String(user_id)),
        eq(biddingsTable.listing_id, String(listing_id)),
      ),
    );

  // if the user has already placed at least a bid on this listing we update that bid instead of making one
  if (existing.length > 0) {
    await db
      .update(biddingsTable)
      .set({ amount_bid: amount })
      .where(
        and(
          eq(biddingsTable.user_id, String(user_id)),
          eq(biddingsTable.listing_id, String(listing_id)),
        ),
      );
  } else {
    // Otherwise just make a new bid
    await db.insert(biddingsTable).values({
      user_id: String(user_id),
      listing_id: String(listing_id),
      amount_bid: amount,
    });
  }
}

export async function getBiddings(listing_id: string | null) {
  if (listing_id == "") return;
  return await db
    .select({
      amount_bid: biddingsTable.amount_bid,
      username: userTable.name,
    })
    .from(biddingsTable)
    .where(eq(biddingsTable.listing_id, String(listing_id)))
    .innerJoin(userTable, eq(biddingsTable.user_id, userTable.id));
}
