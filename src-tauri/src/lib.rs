// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


mod db;
mod statemanager;
use tauri::Manager;
#[cfg(target_os = "windows")]
use tauri_plugin_prevent_default::PlatformOptions;

// We want to clean up the database on app close because we don't want a peristent database rn
// It can't be done on startup because then vue notices a file has changed and rebuilds the app
// That then causes it to cleanse the database again
// So it launches again, etc. it gets stuck in a bootloop
// So we do it on close instead
// So this is added to the CloseRequested event in run()
fn cleanup_db() -> Result<(), String> {
    let db_path = "gearxchange.db";
    if std::fs::metadata(db_path).is_ok() {
        std::fs::remove_file(db_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // We use `block_on` to await the `db::init()` function
    // We cannot actually just await like normal because this is a synchronous function
    // and we are in a synchronous context
    let e = tauri::async_runtime::block_on(db::init());
    if e.is_err() {
        eprintln!("Failed to initialize database: {:?}", e);
    }
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin({
            #[cfg(target_os = "windows")]
            {
                tauri_plugin_prevent_default::Builder::new()
                    .platform(PlatformOptions {
                        general_autofill: false,
                        password_autosave: false,
                    })
                    .build()
            }
            #[cfg(not(target_os = "windows"))]
            {
                tauri_plugin_prevent_default::init()
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet, 
            db::add_user, 
            db::verify_user, 
            db::create_listing,
            db::view_listing,
            db::get_listings,
            db::get_visited_listings,
            db::add_favourite,
            db::remove_favourite,
            db::get_favourite_listings,
            db::execute_query, // This should eventually be removed
            statemanager::get_user_state,
            statemanager::log_out,
    ])
        .on_window_event(|window, event| { // See the comment before cleanup_db() to see why this is necessary
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Block the window from closing immediately
                api.prevent_close();

                if let Err(e) = cleanup_db() {
                    eprintln!("Failed to clean up database: {}", e);
                }

                // Now exit the app
                window.app_handle().exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
