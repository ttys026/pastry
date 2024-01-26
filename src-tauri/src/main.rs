#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use enigo::{
    Direction::{Click, Press, Release},
    Enigo, Key, Keyboard, Settings,
};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

mod spotlight;

#[tauri::command]
fn exec_paste() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.key(Key::Meta, Press).unwrap();
    enigo.key(Key::Unicode('v'), Click).unwrap();
    enigo.key(Key::Meta, Release).unwrap();
}

#[tauri::command]
fn exec_copy() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.key(Key::Meta, Press).unwrap();
    enigo.key(Key::Unicode('c'), Click).unwrap();
    enigo.key(Key::Meta, Release).unwrap();
}

#[tauri::command]
fn run_shell(prog: String, arg: String) -> Result<String, String> {
    let mut command = std::process::Command::new(prog);
    let args = arg.split(' ');
    for arg in args {
        command
            .current_dir(tauri::api::path::home_dir().expect("/"))
            .arg(arg);
    }
    if let Ok(child) = command.spawn() {
        Ok(child.id().to_string().into())
    } else {
        Err("This failed!".into())
    }
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(show);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            spotlight::init_spotlight_window,
            spotlight::show_spotlight,
            spotlight::hide_spotlight,
            exec_copy,
            exec_paste,
            run_shell,
        ])
        .manage(spotlight::State::default())
        .plugin(tauri_plugin_clipboard::init())
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            let window = app.get_window("main").unwrap();
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(16.0))
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
            // Set activation poicy to Accessory to prevent the app icon from showing on the dock
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_always_on_top(true).unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
