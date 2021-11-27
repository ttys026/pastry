import { ipcMain } from 'electron';
import * as storage from './store';

ipcMain.handle('getData', async (_, key: string) => {
  return storage.get(key)
})

ipcMain.handle('setData', async (_, { key, data }: { key: string, data: string }) => {
  return storage.set(key, data);
})

