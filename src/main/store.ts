import { readFileSync, writeFileSync, ensureDirSync, removeSync } from 'fs-extra';
import { join } from 'path';
import { app } from 'electron';

const storageDir = join(app.getPath('userData'), 'storage');

export const get = (key: string) => {
  ensureDirSync(storageDir);
  try {
    return readFileSync(join(storageDir, key), 'utf-8');
  } catch (e) {
    return undefined;
  }
};

export const set = (key: string, value: string) => {
  ensureDirSync(storageDir);
  return writeFileSync(join(storageDir, key), value);
};

export const remove = (key: string) => {
  ensureDirSync(storageDir);
  return removeSync(join(storageDir, key));
};
