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

export const hidePanelAndExec = async (cmd: string) => {
  const [prg, ...rest] = cmd.split(" ");
  await invoke("hide_spotlight");
  await invoke("run_shell", {
    prog: prg,
    arg: rest.join(" "),
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
