import { invoke } from "@tauri-apps/api/tauri";
import { hide } from "tauri-plugin-spotlight-api";

export const hidePanelAndPaste = async () => {
  await hide();
  await invoke("paste");
};
