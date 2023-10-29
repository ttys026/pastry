import { Command } from "@tauri-apps/api/shell";
import { cache } from "./storage";

export const ocr = async (base64: string) => {
  const imgDir = `pastry_image_${Date.now()}_${Math.random()}`;
  const outputDir = `pastry_output_${Date.now()}_${Math.random()}.txt`;
  await cache.set(
    imgDir,
    new Uint8Array(
      atob(base64)
        .split("")
        .map((char) => char.charCodeAt(0))
    )
  );
  console.info({
    imgDir,
    outputDir,
    a: await cache.patch(imgDir),
    b: await cache.patch(outputDir),
  });
  const command = Command.sidecar("binary/OCR", [
    "zh-Hans,en-US",
    "false",
    "true",
    await cache.patch(imgDir),
    await cache.patch(outputDir),
  ]);
  const { code } = await command.execute();
  if (code !== 0) {
    throw new Error("OCR 失败");
  }
  console.info("????", code);
  const output = await cache.get(outputDir);
  cache.remove(outputDir);
  return JSON.parse(output);
};
