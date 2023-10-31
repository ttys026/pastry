import { Command } from "@tauri-apps/api/shell";
import { cache } from "./storage";

export const ocr = async (base64: string) => {
  const imgDir = `pastry_image_${Date.now()}_${Math.random()}`;
  await cache.set(
    imgDir,
    new Uint8Array(
      atob(base64)
        .split("")
        .map((char) => char.charCodeAt(0))
    )
  );
  const command = Command.sidecar("binary/OCR", [
    "-l",
    "zh-Hans",
    "-i",
    await cache.patch(imgDir),
  ]);
  const { code, stdout } = await command.execute();
  if (code !== 0) {
    throw new Error("OCR 失败");
  }
  return stdout;
};
