import { db, userTable, machineryListingsTable } from '~/server/lib/db';

export default defineNitroPlugin(async () => {
  // Run table creation once on server startup
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      hashed_password TEXT NOT NULL,
      location TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES user(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS machinery_listings (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      price INTEGER,
      price_type TEXT NOT NULL,
      condition TEXT NOT NULL,
      location TEXT NOT NULL,
      picture TEXT,
      description TEXT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      vehicle_type TEXT NOT NULL,
      year_of_manufacture INTEGER NOT NULL,
      fuel_or_power TEXT NOT NULL,
      weight INTEGER,
      views INTEGER DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS favourite_listings (
      id INTEGER PRIMARY KEY,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS biddings (
      number TEXT PRIMARY KEY,
      amount INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      listing_id INTEGER NOT NULL,
      FOREIGN KEY(listing_id) REFERENCES machinery_listings(id),
      FOREIGN KEY(user_id) REFERENCES user(id)
    )
  `);

  // Insert default users if not present
  await db.insert(userTable).values([
    { id: 1, email: 'john.doe@agritech.com', hashedPassword: 'hashedpassword1', name:"john" },
    { id: 2, email: 'sarah.smith@greenvalley.org', hashedPassword: 'hashedpassword2', name: "sarah" },
    { id: 3, email: 'mike.chen@premiumfarms.co', hashedPassword: 'hashedpassword3', name: "mike" }
  ]).onConflictDoNothing();

  // Insert default listings if not present
  await db.insert(machineryListingsTable).values([
    {
      id: 1,
      title: 'John Deere 5075E Tractor',
      price: 32500,
      price_type: 'negotiable',
      condition: 'used',
      location: 'Springfield, MO',
      picture: null,
      description: '2018 model with 450 engine hours. Includes front loader and 3-point hitch. Well-maintained service records.',
      make: 'John Deere',
      model: '5075E',
      vehicle_type: 'Utility Tractor',
      year_of_manufacture: 2018,
      fuel_or_power: 'Diesel',
      weight: 5075,
      user_id: 1
    },
    {
      id: 2,
      title: 'Bush Hog SQ720 Rotary Cutter',
      price: 2200,
      price_type: 'fixed',
      condition: 'used',
      location: 'Springfield, MO',
      picture: null,
      description: '6ft heavy-duty brush cutter. Good condition - ready for field work.',
      make: 'Bush Hog',
      model: 'SQ720',
      vehicle_type: 'Rotary Cutter',
      year_of_manufacture: 2017,
      fuel_or_power: 'PTO Powered',
      weight: 1200,
      user_id: 1
    },
    {
      id: 3,
      title: 'Krone 4x4 Round Baler',
      price: 18500,
      price_type: 'negotiable',
      condition: 'used',
      location: 'Springfield, MO',
      picture: null,
      description: '2019 model. Twine wrap system. 5000 bales made. Stored under cover.',
      make: 'Krone',
      model: '4x4',
      vehicle_type: 'Round Baler',
      year_of_manufacture: 2019,
      fuel_or_power: 'Hydraulic',
      weight: 3500,
      user_id: 1
    }
  ]).onConflictDoNothing();
});
