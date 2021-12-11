import { ipcMain } from 'electron';
import { settingWindow } from './main';
import * as storage from './store';

ipcMain.handle('getData', async (_, key: string) => {
  return storage.get(key);
});

ipcMain.handle(
  'setData',
  async (_, { key, data }: { key: string; data: string }) => {
    return storage.set(key, data);
  }
);

ipcMain.handle('removeData', async (_, key: string) => {
  return storage.remove(key);
});

export const log = (type: keyof Console, ...args: any[]) => {
  settingWindow.webContents.send('log', { type, args });
};
