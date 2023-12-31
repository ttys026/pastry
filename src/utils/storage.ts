import { appCacheDir, appDataDir, join } from "@tauri-apps/api/path";
import {
  BinaryFileContents,
  readTextFile,
  removeFile,
  writeBinaryFile,
  writeFile,
  exists,
  createDir,
} from "@tauri-apps/api/fs";

let tempDir = "";
let dataDir = "";

const getTempPath = async (key: string) => {
  if (!tempDir) {
    tempDir = await appCacheDir();
    if (!(await exists(tempDir))) {
      await createDir(tempDir);
    }
  }
  return await join(tempDir, key);
};

const getDataPath = async (key: string) => {
  if (!dataDir) {
    dataDir = await appDataDir();
    if (!(await exists(dataDir))) {
      await createDir(dataDir);
    }
  }
  return await join(dataDir, key);
};

class Storage {
  public patch = async (key: string) => key;

  constructor(params: { patch: (key: string) => Promise<string> }) {
    this.patch = params.patch;
  }
  public get = async (key: string) => {
    const path = await this.patch(key);
    return readTextFile(path);
  };
  public set = async (key: string, value: string | BinaryFileContents) => {
    const path = await this.patch(key);
    if (typeof value === "string") {
      await writeFile(path, value);
    } else {
      await writeBinaryFile(path, value);
    }
  };
  public remove = async (key: string) => {
    await removeFile(await this.patch(key));
  };
}

export const cache = new Storage({ patch: getTempPath });
export const storage = new Storage({ patch: getDataPath });
export const STORE_KEY = {
  HISTORY: "history",
  PINS: "pins",
};
