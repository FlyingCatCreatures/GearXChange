import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

import sqlite from "better-sqlite3";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";

import type { InferSelectModel } from "drizzle-orm";
import { sql } from "drizzle-orm";

const sqliteDB = sqlite(":memory:");
sqliteDB.pragma("foreign_keys = ON");

export const db = drizzle(sqliteDB);

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  location: text("location")
});

export const sessionTable = sqliteTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull(),
	expiresAt: integer("expires_at").notNull()
});


export type User = InferSelectModel<typeof userTable>;
export type Session = InferSelectModel<typeof sessionTable>

// --- MACHINERY LISTINGS TABLE ---
export const machineryListingsTable = sqliteTable("machinery_listings", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  price: integer("price"), // Use integer for simplicity; change to real if needed
  price_type: text("price_type").notNull(),
  condition: text("condition").notNull(),
  location: text("location").notNull(),
  picture: text("picture"),
  description: text("description"),
  make: text("make").notNull(),
  model: text("model").notNull(),
  vehicle_type: text("vehicle_type").notNull(),
  year_of_manufacture: integer("year_of_manufacture").notNull(),
  fuel_or_power: text("fuel_or_power").notNull(),
  weight: integer("weight"),
  views: integer("views").default(0),
  user_id: text("user_id").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

// --- FAVOURITE LISTINGS TABLE ---
export const favouriteListingsTable = sqliteTable("favourite_listings", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  listing_id: text("listing_id").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const biddingsTable = sqliteTable("biddings", {
  number: integer("number").primaryKey(),
  amount_bid: integer("amount").notNull(),
  user_id: text("user_id")
    .notNull(),
  listing_id: text("listing_id")
    .notNull()
});
// --- HELPERS ---
export const adapter = new DrizzleSQLiteAdapter(db , sessionTable, userTable);

