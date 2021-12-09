import { ipcMain } from 'electron';
import { settingWindow } from './main';
import * as storage from './store';

ipcMain.handle('getData', async (_, key: string) => {
  return storage.get(key)
})

ipcMain.handle('setData', async (_, { key, data }: { key: string, data: string }) => {
  return storage.set(key, data);
})


export const log = (payload: string) => {
  console.log('emit', payload);
  settingWindow.webContents.send('log', payload);
}