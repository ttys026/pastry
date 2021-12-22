import { clipboard, Data, ipcMain } from 'electron';
import { searchWindow, settingWindow } from './main';
import { manager } from './clipboardManager';
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

ipcMain.handle('hide', () => searchWindow.hide());

ipcMain.handle('removeData', async (_, key: string | string[]) => {
  return storage.remove(key);
});

ipcMain.handle('getHistories', () => {
  return {
    list: manager.getHistories(),
    updateTime: manager.updateTime,
  };
});

ipcMain.handle('copyItem', (_, ele: Data) => {
  clipboard.write(ele);
});

export const log = (type: keyof Console, ...args: any[]) => {
  settingWindow.webContents.send('log', { type, args });
};
