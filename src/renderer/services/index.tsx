export const getTreeData = async () => {
  return await window.ipcRenderer.invoke('getData', 'tree');
};

export const saveTreeData = async (data: string) => {
  await window.ipcRenderer.invoke('setData', { key: 'tree', data });
};

export const getContent = async (key: string) => {
  return await window.ipcRenderer.invoke('getData', key);
};

export const setContent = async (key: string, data: string) => {
  return await window.ipcRenderer.invoke('setData', { key, data });
};

export const removeContent = async (key: string | string[]) => {
  return await window.ipcRenderer.invoke('removeData', key);
};

export const getHistories = async () => {
  return await window.ipcRenderer.invoke('getHistories');
};
export const copyItem = async (data: any) => {
  return await window.ipcRenderer.invoke('copyItem', data);
};
