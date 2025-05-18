const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');
const logger = require('./logger.js');
const log = (...msgs) => {logger.log(...msgs);};
const logError = (...msgs) => {logger.error(...msgs);};

class Database {
    #db;
    #usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // Alphanumeric and underscores, 3-20 characters

    // Best regex I could find for email validation
    // If you find a better one you can test it at https://jsfiddle.net/kuo1vzg9/ against some emails
    // Note that it should fail when the 'multiple' attribute is set, as something like "a@p.com,b@p.com" is not a valid email
    #emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/; 
    #phoneRegex = /^(?:\d{2}-|\d{3}-|\d{2}|\d{3})?\d{8}$/; 
    #random_salt = Math.floor(Math.random() * 500000)+500000; // Random salt for hashing
    #hash = (password, username) => md5("gearXchange" + this.#random_salt + password + username); // Hash function with random salt and userspecific salt
    
    constructor(file) {
        this.#db = new sqlite3.Database(file);

        // Currently, we're using a database in memmory not a file, so nothing is saved
        // Therefore the database has to be recreated every time the app is started
        this.#createTables();
        this.#insertValues();
    }

    #createTables() {
        this.#db.serialize(() => {
            // Main table of all available listings
            this.#db.run(
                `CREATE TABLE machinery_listings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    price REAL, -- NULL if 'on request'
                    price_type TEXT NOT NULL CHECK (price_type IN ('fixed', 'negotiable', 'on request')),
                    condition TEXT NOT NULL CHECK (condition IN ('new', 'good as new', 'used', 'heavily used')),
                    location TEXT NOT NULL,
                    picture_url TEXT,
                    description TEXT,
                    make TEXT NOT NULL,
                    model TEXT NOT NULL,
                    vehicle_type TEXT NOT NULL,
                    year_of_manufacture INTEGER CHECK (year_of_manufacture >= 1800 AND year_of_manufacture <= 2025),
                    fuel_or_power TEXT NOT NULL,
                    weight REAL, -- in kilograms or specify elsewhere
                    user_id INTEGER
                );`
            );

            // Table of user accounts
            this.#db.run(
                `CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT,
                    full_name TEXT,
                    phone TEXT,
                    location TEXT,
                    created_at TEXT NOT NULL DEFAULT (datetime('now'))
                );`
            );
        });
    }

    #insertValues() {
        // Insert initial listings and users using the class methods
        try {
            // Insert users
            this.addUser('john_doe', 'john.doe@agritech.com', 'password1', 'John Doe', '(417) 555-0123', 'Springfield, MO');
            this.addUser('sarah_smith', 'sarah.smith@greenvalley.org', 'password2', 'Sarah Smith', '(620) 555-0456', 'Green Valley Farm, KS');
            this.addUser('mike_chen', 'mike.chen@premiumfarms.co', 'password3', 'Michael Chen', '(316) 555-0789', 'Wichita, KS');
            this.addUser('em_jackson', 'emily.j@sunnyacres.com', 'password4', 'Emily Jackson', '(785) 555-0248', 'Sunny Acres Ranch, NE');
            this.addUser('carlos_m', 'carlos.mendoza@vinyard.org', 'password5', 'Carlos Mendoza', '(913) 555-0999', 'Heartland Vineyards, MO');
            this.addUser('linda_weber', 'linda.weber@protonmail.com', 'password6', 'Linda Weber', '(314) 555-0333', 'St. Louis, MO');

            // Insert listings
            this.createListing('John Deere 5075E Tractor', 32500.00, 'negotiable', 'used', 'Springfield, MO', 'johndeere-5075e.jpg', '2018 model with 450 engine hours. Includes front loader and 3-point hitch. Well-maintained service records.', 'John Deere', '5075E', 'Utility Tractor', 2018, 'Diesel', 5075, 1);
            this.createListing('Bush Hog SQ720 Rotary Cutter', 2200.00, 'fixed', 'used', 'Springfield, MO', 'bush-hog-sq720.jpg', '6ft heavy-duty brush cutter. Good condition - ready for field work.', 'Bush Hog', 'SQ720', 'Rotary Cutter', 2017, 'PTO Powered', 1200, 1);
            this.createListing('Krone 4x4 Round Baler', 18500.00, 'negotiable', 'used', 'Springfield, MO', 'krone-balers.jpg', '2019 model. Twine wrap system. 5000 bales made. Stored under cover.', 'Krone', '4x4', 'Round Baler', 2019, 'Hydraulic', 3500, 1);
            this.createListing('Case IH 2206 Cotton Picker', 149999.00, 'negotiable', 'used', 'Green Valley Farm, KS', 'case-ih-2206.jpg', '2015 model w/ 2300 engine hours. 4-row narrow picker. Field-ready condition.', 'Case IH', '2206', 'Cotton Picker', 2015, 'Diesel', 18000, 2);
            this.createListing('Kubota L2501 Compact Tractor', 19500.00, 'fixed', 'new', 'Wichita, KS', 'kubota-l2501.jpg', 'Brand new 25HP tractor with loader. 0 hours. Financing available.', 'Kubota', 'L2501', 'Compact Tractor', 2023, 'Diesel', 2532, 3);
            this.createListing('Horsch Joker 4 Cultivator', 8750.00, 'negotiable', 'used', 'Wichita, KS', 'horsch-joker4.jpg', '12ft working width. Excellent seedbed preparation tool.', 'Horsch', 'Joker 4', 'Cultivator', 2020, 'Tractor-Powered', 1800, 3);
            this.createListing('New Holland H7250 Baler', 42200.00, 'fixed', 'used', 'Heartland Vineyards, MO', 'newholland-h7250.jpg', '2020 model square baler. Net wrap system. Only 1500 bales made.', 'New Holland', 'H7250', 'Square Baler', 2020, 'Hydraulic', 4200, 5);
    
        } catch (err) {
            logError("Error inserting initial values into database:", err.message);
        }
    }

    addUser(username, email, password, full_name, phone, location) {
        if (!this.#usernameRegex.test(username)) {
            throw new Error("Invalid username. Must be 3-20 characters long and can only contain letters, numbers, and underscores.");
        }
        if (!this.#emailRegex.test(email)) {
            throw new Error("Invalid email format.");
        }
        /*if (!this.#phoneRegex.test(phone)) { this is disabled for now because the phone number regex is wrong
            throw new Error("Invalid phone number format.");
        }*/
        log("Adding user:", username, email, full_name, phone, location, password);
        // Insert the user 
        this.#db.run(
            `INSERT INTO users (username, email, password_hash, full_name, phone, location) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [username, email, this.#hash(password,username), full_name, phone, location],
            (err) => {
                if (err) {
                    logError("error adding user:", err.message);
                    return;
                }
            }
        );
    }

    getUsernameByEmail(email) {
        return new Promise((resolve, reject) => {
            this.#db.get(
                `SELECT username FROM users WHERE email = ?`,
                [email],
                (err, row) => {
                    if (err) {
                        reject(err); // Reject the promise if there's an error
                    } else if (row) {
                        resolve(row.username); // Resolve the promise with the username
                    } else {
                        resolve(null); // Resolve with null if no user is found
                    }
                }
            );
        });
    }

    getIdByUsername(username) {
        return new Promise((resolve, reject) => {
            this.#db.get(
                `SELECT id FROM users WHERE username = ?`,
                [username],
                (err, row) => {
                    if (err) {
                        reject(err); // Reject the promise if there's an error
                    } else if (row) {
                        resolve(row.id); // Resolve the promise with the username
                    } else {
                        resolve(null); // Resolve with null if no user is found
                    }
                }
            );
        });
    }

    verifyUserByEmail(email, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const username = await this.getUsernameByEmail(email);
                if (!username) {
                    resolve(false); // Resolve with false if the user is not found
                    return;
                }
    
                this.#db.get(
                    `SELECT id FROM users WHERE email = ? AND password_hash = ?`,
                    [email, this.#hash(password, username)],
                    (err, row) => {
                        if (err) {
                            logError("error verifying user by email:", err.message);
                            reject(err); // Default to rejecting on error
                        } else if (row) {
                            log("User", username ,"verified successfully.");
                            resolve(true); // User verified successfully
                        } else {
                            log("Invalid login for user", username);
                            resolve(false); // User not verified
                        }
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    verifyUserByName(username, password) {
        return new Promise((resolve, reject) => {
            this.#db.get(
                `SELECT id FROM users WHERE username = ? AND password_hash = ?`,
                [username, this.#hash(password, username)],
                (err, row) => {
                    if (err) {
                        logError("error verifying user by username:", err.message);
                        reject(err); // Default to rejecting on error
                    } else if (row) {
                        log("User", username ,"verified successfully.");
                        resolve(true); // User verified successfully
                    } else {
                        log("Invalid login for user", username);
                        resolve(false); // User not verified
                    }
                }
            );
        });
    }

    createListing(
        title, price, price_type, condition, location, picture_url, description, 
        make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, 
        user_id
    ) {
        // Just like addUser, this is ran as a parameterised query by using the ? placeholders
        // This prevents SQL injection attacks
        this.#db.run(
            `INSERT INTO machinery_listings (title, price, price_type, condition, location, picture_url, description, make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, user_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, price, price_type, condition, location, picture_url, description, make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, user_id],
            (err) => {
                if (err) {
                    logError("Error inserting into machinery_listings:", err.message, "Listing:", title, price, price_type, condition, location, picture_url, description, make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight);
                }
            }
        );
    }

     // DANGEROUS! JUST FOR TESTING
     // Currently still used in the following cases that should be replaced with a better solution in due time:
        // 1. In listingsPage.js to get all listings
     all(query, callback) {
        this.#db.all(query, callback);
    }
}

// This is a singleton pattern, so we only have one instance of the database
const db = new Database(':memory:'); 
module.exports = db;