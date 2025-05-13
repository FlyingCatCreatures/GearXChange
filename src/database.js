const sqlite3 = require('sqlite3').verbose();

class Database {
    constructor(file) {
        this.db = new sqlite3.Database(file);

        // Currently, we're using a database in memmory not a file, so nothing is saved
        // Therefore the database has to be recreated every time the app is started
        this.createTables();
        this.insertValues();
    }

    #close() {
        this.db.close((err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log("Database closed.");
            }
        });
    }

    createTables() {
        this.db.serialize(() => {
            // Main table of all available listings
            this.db.run(
                `CREATE TABLE machinery_listings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    price REAL, -- NULL if 'on request'
                    price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'negotiable', 'on request')),
                    condition TEXT NOT NULL CHECK (condition IN ('new', 'good as new', 'used', 'heavily used')),
                    location TEXT NOT NULL,
                    picture_url TEXT,
                    description TEXT,
                    product_details_id INTEGER,
                    user_id INTEGER
                );`);

            // Table for product details as documented on the figma that was made
            this.db.run(`
                CREATE TABLE product_details (
                    id INTEGER PRIMARY KEY,
                    make TEXT NOT NULL,
                    model TEXT NOT NULL,
                    vehicle_type TEXT NOT NULL,
                    year_of_manufacture INTEGER CHECK (year_of_manufacture >= 1800 AND year_of_manufacture <= 2025),
                    fuel_or_power TEXT NOT NULL,
                    weight REAL -- in kilograms or specify elsewhere
                );`);

            // Table of user accounts
            this.db.run(
                `CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    full_name TEXT,
                    phone TEXT,
                    location TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                );`);
            console.log("Created tables in database.");
        });

    }

    insertValues() {
        this.db.serialize(() => {
            // Initialize listings
            this.db.run(
                `INSERT INTO 
                machinery_listings (title, price, price_type, condition, location, picture_url, description, product_details_id, user_id)
                VALUES 
                    ('John Deere 5075E Tractor', 32500.00, 'negotiable', 'used', 'Springfield, MO', 'johndeere-5075e.jpg', '2018 model with 450 engine hours. Includes front loader and 3-point hitch. Well-maintained service records.', 1, 1),
                    ('Bush Hog SQ720 Rotary Cutter', 2200.00, 'fixed', 'used', 'Springfield, MO', 'bush-hog-sq720.jpg', '6ft heavy-duty brush cutter. Good condition - ready for field work.', 2, 1),
                    ('Krone 4x4 Round Baler', 18500.00, 'negotiable', 'used', 'Springfield, MO', 'krone-balers.jpg', '2019 model. Twine wrap system. 5000 bales made. Stored under cover.', 3, 1),
                    ('Case IH 2206 Cotton Picker', 149999.00, 'negotiable', 'used', 'Green Valley Farm, KS', 'case-ih-2206.jpg', '2015 model w/ 2300 engine hours. 4-row narrow picker. Field-ready condition.', 4, 2),
                    ('Kubota L2501 Compact Tractor', 19500.00, 'fixed', 'new', 'Wichita, KS', 'kubota-l2501.jpg', 'Brand new 25HP tractor with loader. 0 hours. Financing available.', 5, 3),
                    ('Horsch Joker 4 Cultivator', 8750.00, 'negotiable', 'used', 'Wichita, KS', 'horsch-joker4.jpg', '12ft working width. Excellent seedbed preparation tool.', 6, 3),
                    ('New Holland H7250 Baler', 42200.00, 'fixed', 'used', 'Heartland Vineyards, MO', 'newholland-h7250.jpg', '2020 model square baler. Net wrap system. Only 1500 bales made.', 7, 5);`
            );

            // Initialize detail pages
            this.db.run(
                `INSERT INTO 
                product_details (id, make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight)
                VALUES 
                    (1, 'John Deere', '5075E', 'Utility Tractor', 2018, 'Diesel', 5075),
                    (2, 'Bush Hog', 'SQ720', 'Rotary Cutter', 2017, 'PTO Powered', 1200),
                    (3, 'Krone', '4x4', 'Round Baler', 2019, 'Hydraulic', 3500),
                    (4, 'Case IH', '2206', 'Cotton Picker', 2015, 'Diesel', 18000),
                    (5, 'Kubota', 'L2501', 'Compact Tractor', 2023, 'Diesel', 2532),
                    (6, 'Horsch', 'Joker 4', 'Cultivator', 2020, 'Tractor-Powered', 1800),
                    (7, 'New Holland', 'H7250', 'Square Baler', 2020, 'Hydraulic', 4200);`
            );

            // Initialize users
            this.db.run(
                `INSERT INTO 
                users (id, username, email, password_hash, full_name, phone, location)
                VALUES 
                    (1, 'john_doe', 'john.doe@agritech.com', '5f4dcc3b5aa765d61d8327deb882cf99', 'John Doe', '(417) 555-0123', 'Springfield, MO'),
                    (2, 'sarah_smith', 'sarah.smith@greenvalley.org', '6c569aabbf7775ef8fc5705a9f1f9b2f', 'Sarah Smith', '(620) 555-0456', 'Green Valley Farm, KS'),
                    (3, 'mike_chen', 'mike.chen@premiumfarms.co', '098f6bcd4621d373cade4e832627b4f6', 'Michael Chen', '(316) 555-0789', 'Wichita, KS'),
                    (4, 'em_jackson', 'emily.j@sunnyacres.com', 'd8578edf8458ce06fbc5bb76a58c5ca4', 'Emily Jackson', '(785) 555-0248', 'Sunny Acres Ranch, NE'),
                    (5, 'carlos_m', 'carlos.mendoza@vinyard.org', 'e99a18c428cb38d5f260853678922e03', 'Carlos Mendoza', '(913) 555-0999', 'Heartland Vineyards, MO'),
                    (6, 'linda_weber', 'linda.weber@protonmail.com', 'b1b3773a05c0ed0176787a4f1574ff00', 'Linda Weber', '(314) 555-0333', 'St. Louis, MO')
                ;`
            );

            console.log("Inserted initial values.");
        });
    }
    //DANGEROUS! JUST FOR TESTING
    run(command){
        this.db.serialize(() => {
            this.db.run(command, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }
    //DANGEROUS! JUST FOR TESTING
    all(command){
        this.db.serialize(() => {
            this.db.all(command, (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        });
    }
}

module.exports = Database;