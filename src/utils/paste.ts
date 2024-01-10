import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/shell";

export const hidePanelAndPaste = async () => {
  await invoke("hide_spotlight");
  await paste();
};

export const hidePanelAndOpen = async (link: string, app?: string) => {
  await invoke("hide_spotlight");
  await open(link, app);
};

export const hidePanelAndExec = async () => {
  await invoke("hide_spotlight");
  await invoke("run_shell", {
    prog: "emulator",
    arg: "-avd Pixel_3a_API_34_extension_level_7_arm64-v8a",
  })
    .then(console.log)
    .catch(console.warn);
};

export const paste = async () => {
  await invoke("exec_paste");
};

export const copy = async () => {
  await invoke("exec_copy");
};
