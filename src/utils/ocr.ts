import { tempdir } from "@tauri-apps/api/os";
import { readTextFile, removeFile, writeBinaryFile } from "@tauri-apps/api/fs";
import { Command } from "@tauri-apps/api/shell";

let tempdirPath = "";

export const ocr = async (base64: string) => {
  if (!tempdirPath) {
    tempdirPath = await tempdir();
  }
  const imgDir = `${tempdirPath}pastry_image_${Date.now()}_${Math.random()}.txt`;
  const outputDir = `${tempdirPath}pastry_output_${Date.now()}_${Math.random()}.txt`;
  await writeBinaryFile(
    imgDir,
    new Uint8Array(
      atob(base64)
        .split("")
        .map((char) => char.charCodeAt(0))
    )
  );
  console.info({ imgDir, outputDir });
  const command = Command.sidecar("binary/OCR", [
    "zh-Hans,en-US",
    "false",
    "true",
    imgDir,
    outputDir,
  ]);
  const { code } = await command.execute();
  if (code !== 0) {
    throw new Error("OCR 失败");
  }
  const output = await readTextFile(outputDir);
  removeFile(outputDir);
  return JSON.parse(output);
};
