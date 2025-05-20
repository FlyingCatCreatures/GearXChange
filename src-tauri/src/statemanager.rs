// This file just exists to handle state that should not be altered by the user
// The client cannot directly alter state but can retrieve it

use std::sync::{Arc, RwLock};
use tauri::command;
use once_cell::sync::Lazy;
use tauri::AppHandle;
use tauri::Emitter;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct UserState {
    pub username: String,
    pub permission_level: String, // "none", "regular", or "admin"
}

// Initialize the global state with default values
static STATE: Lazy<Arc<RwLock<UserState>>> = Lazy::new(|| {
    Arc::new(RwLock::new(UserState {
        username: String::from(""),
        permission_level: String::from("none"),
    }))
});

// Getter for the current logged in user state
#[command]
pub fn get_user_state() -> UserState {
    let state = STATE.read().unwrap();
    state.clone()
}

// Function to set the current user's state
// Not a command, so not accessible from the client
pub fn set_user_state(username: String, permission_level: String, app_handle: &AppHandle) -> Result<(), String> {
    if !["none", "regular", "admin"].contains(&permission_level.as_str()) {
        return Err("Invalid permission level".to_string());
    }

    let mut state = STATE.write().unwrap();
    state.username = username.clone();
    state.permission_level = permission_level.clone();

    // Give the frontend an event that the user state has been updated along with the new state
    // Usefull for UI elements that need to update dynamically with this state
    app_handle.emit("user-state-updated", &state.clone())
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Making this accessible to the client poses no security threats
#[command]
pub fn log_out() {
    let mut state = STATE.write().unwrap();
    state.username = String::from("");
    state.permission_level = String::from("none");
}