declare module "prismjs/*";

interface Window {
  ipcRenderer: import('electron').IpcRenderer;
}