import { Command } from "@tauri-apps/api/shell";
import { hide } from "tauri-plugin-spotlight-api";

export const hidePanelAndPaste = async () => {
  await hide();
  await paste();
};

export const paste = async () => {
  const command = Command.sidecar("binary/sendkeys", [
    "--characters",
    "<c:v:command>",
    "--initial-delay",
    "0",
  ]);
  const { code } = await command.execute();
  console.log("code", code);
  if (code !== 0) {
    throw new Error("paste failed");
  }
};
export const copy = async () => {
  const command = Command.sidecar("binary/sendkeys", [
    "--characters",
    "<c:c:command>",
    "--initial-delay",
    "0",
  ]);
  const { code } = await command.execute();
  if (code !== 0) {
    throw new Error("paste failed");
  }
};
