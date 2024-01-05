import { invoke } from "@tauri-apps/api/tauri";

export const hidePanelAndPaste = async () => {
  await invoke("hide_spotlight");
  await paste();
};

export const paste = async () => {
  await invoke('exec_paste');
};

export const copy = async () => {
  await invoke('exec_copy');
};
