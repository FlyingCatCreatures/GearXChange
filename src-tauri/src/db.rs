use sqlx::{sqlite::SqlitePool, Executor, Row}; // For interacting with database
use tauri::command; // For interacting with frontend
use sha2::{Digest, Sha256}; // For hashing passwords
use std::fs; // For file operations
use tauri::AppHandle; // For passing along to the state manager in verify_user


fn hash(salt: &str, password: &str, username: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(format!("{}{}{}", salt, password, username));
    format!("{:x}", hasher.finalize())
}

async fn connect() -> Result<SqlitePool, String> {
    let db_path = "gearxchange.db";

    // Check if the database file exists
    if !fs::metadata(db_path).is_ok() {
        // If it doesn't exist, create it
        fs::File::create(db_path).map_err(|e| e.to_string())?;
    }

    SqlitePool::connect(&format!("sqlite:{}", db_path))
        .await
        .map_err(|e| e.to_string())
}

async fn insert_initial_data() -> Result<(), String> {
    // Add users
    add_user("john_doe", "john.doe@agritech.com", "password1", "John Doe", "(417) 555-0123").await?;
    add_user("sarah_smith", "sarah.smith@greenvalley.org", "password2", "Sarah Smith", "(620) 555-0456").await?;
    add_user("mike_chen", "mike.chen@premiumfarms.co", "password3", "Michael Chen", "(316) 555-0789").await?;
    add_user("em_jackson", "emily.j@sunnyacres.com", "password4", "Emily Jackson", "(785) 555-0248").await?;
    add_user("carlos_m", "carlos.mendoza@vinyard.org", "password5", "Carlos Mendoza", "(913) 555-0999").await?;
    add_user("linda_weber", "linda.weber@protonmail.com", "password6", "Linda Weber", "(314) 555-0333").await?;

    // Add listings
    create_listing(
        "John Deere 5075E Tractor",
        Some(32500.00),
        "negotiable",
        "used",
        "Springfield, MO",
        Some("johndeere-5075e.jpg"),
        Some("2018 model with 450 engine hours. Includes front loader and 3-point hitch. Well-maintained service records."),
        "John Deere",
        "5075E",
        "Utility Tractor",
        2018,
        "Diesel",
        Some(5075.0),
        1,
    ).await?;
    create_listing(
        "Bush Hog SQ720 Rotary Cutter",
        Some(2200.00),
        "fixed",
        "used",
        "Springfield, MO",
        Some("bush-hog-sq720.jpg"),
        Some("6ft heavy-duty brush cutter. Good condition - ready for field work."),
        "Bush Hog",
        "SQ720",
        "Rotary Cutter",
        2017,
        "PTO Powered",
        Some(1200.0),
        1,
    ).await?;
    create_listing(
        "Krone 4x4 Round Baler",
        Some(18500.00),
        "negotiable",
        "used",
        "Springfield, MO",
        Some("krone-balers.jpg"),
        Some("2019 model. Twine wrap system. 5000 bales made. Stored under cover."),
        "Krone",
        "4x4",
        "Round Baler",
        2019,
        "Hydraulic",
        Some(3500.0),
        1,
    ).await?;
    create_listing(
        "Case IH 2206 Cotton Picker",
        Some(149999.00),
        "negotiable",
        "used",
        "Green Valley Farm, KS",
        Some("case-ih-2206.jpg"),
        Some("2015 model w/ 2300 engine hours. 4-row narrow picker. Field-ready condition."),
        "Case IH",
        "2206",
        "Cotton Picker",
        2015,
        "Diesel",
        Some(18000.0),
        2,
    ).await?;
    create_listing(
        "Kubota L2501 Compact Tractor",
        Some(19500.00),
        "fixed",
        "new",
        "Wichita, KS",
        Some("kubota-l2501.jpg"),
        Some("Brand new 25HP tractor with loader. 0 hours. Financing available."),
        "Kubota",
        "L2501",
        "Compact Tractor",
        2023,
        "Diesel",
        Some(2532.0),
        3,
    ).await?;
    create_listing(
        "Horsch Joker 4 Cultivator",
        Some(8750.00),
        "negotiable",
        "used",
        "Wichita, KS",
        Some("horsch-joker4.jpg"),
        Some("12ft working width. Excellent seedbed preparation tool."),
        "Horsch",
        "Joker 4",
        "Cultivator",
        2020,
        "Tractor-Powered",
        Some(1800.0),
        3,
    ).await?;
    create_listing(
        "New Holland H7250 Baler",
        Some(42200.00),
        "fixed",
        "used",
        "Heartland Vineyards, MO",
        Some("newholland-h7250.jpg"),
        Some("2020 model square baler. Net wrap system. Only 1500 bales made."),
        "New Holland",
        "H7250",
        "Square Baler",
        2020,
        "Hydraulic",
        Some(4200.0),
        5,
    ).await?;

    Ok(())
}

#[command]
pub async fn init() -> Result<(), String> {
    let pool = connect().await?;

    // Create tables
    let create_users_table = r#"
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT,
            full_name TEXT,
            phone TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    "#;

    let create_listings_table = r#"
        CREATE TABLE IF NOT EXISTS machinery_listings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            price REAL,
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
            weight REAL,
            views INTEGER DEFAULT 0,
            user_id INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    "#;

    pool.execute(create_users_table).await.map_err(|e| e.to_string())?;
    pool.execute(create_listings_table).await.map_err(|e| e.to_string())?;

    // Insert dummy data for testing
    insert_initial_data().await.map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn add_user(
    username: &str,
    email: &str,
    password: &str,
    full_name: &str,
    phone: &str,
) -> Result<(), String> {
    println!("Adding user: {} {} {} {} {}", username, email, password, full_name, phone);
    let pool = connect().await?;

    // Hash the password
    let salt = "gearXchange"; 
    let password_hash = hash(salt, password, username);


    let query = r#"
        INSERT INTO users (username, email, password_hash, full_name, phone)
        VALUES ($1, $2, $3, $4, $5);
    "#;

    sqlx::query(query)
        .bind(username) // $1
        .bind(email) // $2
        .bind(password_hash) // $3
        .bind(full_name) // $4
        .bind(phone) // $5
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn verify_user(username: &str, password: &str, app_handle: AppHandle,) -> Result<bool, String> {
    let pool = connect().await?;

    // Hash the password
    let salt = "gearXchange";
    let password_hash = hash(salt, password, username);
    let password_hash_ref = &password_hash; // Reference used because the borrow checker complains about using it twice

    let query_name = r#"
        SELECT COUNT(*) FROM users WHERE username = $1 AND password_hash = $2;
    "#;

    let count_name: (i64,) = sqlx::query_as(query_name)
        .bind(username) // $1
        .bind(password_hash_ref) // $2 
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?;

    // Can also login by email so we have to check for that
    let query_email = r#"
        SELECT COUNT(*) FROM users WHERE email = $1 AND password_hash = $2;
    "#;

    let count_email: (i64,) = sqlx::query_as(query_email)
        .bind(username) // $1
        .bind(password_hash_ref) // $2
        .fetch_one(&pool)
        .await
        .map_err(|e| e.to_string())?;   

    let verified = count_email.0 > 0 || count_name.0 > 0;
    let permissions: String = String::from("regular");
    if verified {
        if let Err(e) = crate::statemanager::set_user_state(username.to_string(), permissions, &app_handle) {
            return Err(format!("Failed to set user state: {}", e));
        }
    }
    Ok(count_email.0 > 0 || count_name.0 > 0)
}

#[command]
pub async fn create_listing(
    title: &str,
    price: Option<f64>,
    price_type: &str,
    condition: &str,
    location: &str,
    picture_url: Option<&str>,
    description: Option<&str>,
    make: &str,
    model: &str,
    vehicle_type: &str,
    year_of_manufacture: i32,
    fuel_or_power: &str,
    weight: Option<f64>,
    user_id: i32,
) -> Result<(), String> {
    let pool = connect().await?;

    let query = r#"
        INSERT INTO machinery_listings (
            title, price, price_type, condition, location, picture_url, description,
            make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    "#;

    sqlx::query(query)
        .bind(title) // $1
        .bind(price) // $2
        .bind(price_type) // $3
        .bind(condition) // $4
        .bind(location) // $5
        .bind(picture_url) // $6
        .bind(description) // $7
        .bind(make) // $8
        .bind(model) // $9
        .bind(vehicle_type) // $10
        .bind(year_of_manufacture) // $11
        .bind(fuel_or_power) // $12
        .bind(weight) // $13
        .bind(user_id) // $14
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn view_listing(id: i16) -> Result<(), String> {
    let pool = connect().await?;

    let query = r#"
        UPDATE machinery_listings
        SET views = views + 1
        WHERE id = $1;
    "#;

    let result = sqlx::query(query)
        .bind(id) // $1
        .execute(&pool)
        .await;

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to update views for listing with id '{}': {}", id, e)),
    }
}

#[command]
pub async fn get_listings(ordering: &str) -> Result<Vec<serde_json::Value>, String> {
    let pool = connect().await?;

    let order_by_clause = match ordering {
        "price_asc" => "price ASC",       // Order by lowest price
        "price_desc" => "price DESC",     // Order by highest price
        "date_desc" => "created_at DESC", // Order by most recently created
        _ => "views DESC",                // Default: order by most viewed

    };

    let query = format!(
        r#"
        SELECT id, title, price, price_type, condition, location, picture_url, description,
               make, model, vehicle_type, year_of_manufacture, fuel_or_power, weight, views, created_at, user_id
        FROM machinery_listings
        ORDER BY {};
        "#,
        order_by_clause
    );

    let rows = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    
    // Convert rows to JSON for easier frontend consumption
    let listings: Vec<serde_json::Value> = rows
        .into_iter()
        .map(|row| {
            serde_json::json!({
                "id": row.get::<i64, _>("id"),
                "title": row.get::<String, _>("title"),
                "price": row.get::<Option<f64>, _>("price"),
                "price_type": row.get::<String, _>("price_type"),
                "condition": row.get::<String, _>("condition"),
                "location": row.get::<String, _>("location"),
                "picture_url": row.get::<Option<String>, _>("picture_url"),
                "description": row.get::<Option<String>, _>("description"),
                "make": row.get::<String, _>("make"),
                "model": row.get::<String, _>("model"),
                "vehicle_type": row.get::<String, _>("vehicle_type"),
                "year_of_manufacture": row.get::<i32, _>("year_of_manufacture"),
                "fuel_or_power": row.get::<String, _>("fuel_or_power"),
                "weight": row.get::<Option<f64>, _>("weight"),
                "views": row.get::<i64, _>("views"),
                "created_at": row.get::<String, _>("created_at"),
                "user_id": row.get::<i64, _>("user_id"),
            })
        })
        .collect();

    Ok(listings)
}



