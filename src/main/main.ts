/* eslint global-require: off, no-console: off, promise/always-return: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Tray,
  screen,
  globalShortcut,
  systemPreferences
} from 'electron';
import robot from 'robotjs';
import getMenu from './menu';
import { initClipboardListener } from './clipboardManager';
import { resolveHtmlPath } from './util';


let mainWindow: BrowserWindow | null = null;
let settingWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

require('electron-debug')();

const init = async () => {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const iconActive = getAssetPath('icons/24x24.png');
  const icon = getAssetPath('icons/24x24-0.7.png');

  tray = new Tray(icon, '0');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Make Doughs', click: () => settingWindow?.show() },
    { type: 'separator' },
    {
      label: 'Quit Pastry',
      click: () => {
        settingWindow?.destroy();
        app.quit();
      },
    },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);
  tray.setPressedImage(iconActive);

  mainWindow = new BrowserWindow({
    show: false,
    paintWhenInitiallyHidden: true,
    x: 0,
    y: 0,
    simpleFullscreen: true,
    icon: getAssetPath('icon.png'),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
  });

  settingWindow = new BrowserWindow({
    show: false,
    paintWhenInitiallyHidden: true,
    center: true,
    width: 800,
    height: 600,
    icon: getAssetPath('icon.png'),
    title: 'Pastry',
    acceptFirstMouse: true,
    fullscreenable: true,
    resizable: false,
    simpleFullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const cancelClipboardListener = initClipboardListener();

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    cancelClipboardListener();
  });

  settingWindow.loadURL(resolveHtmlPath('index.html'));

  settingWindow.on('close', (e) => {
    e.preventDefault();
    settingWindow?.hide();
  });

  mainWindow?.setAlwaysOnTop(true, 'screen-saver');
  mainWindow?.setVisibleOnAllWorkspaces(true, {
    skipTransformProcessType: true,
  });
  mainWindow?.setFullScreenable(false);

  setTimeout(() => {
    app.dock.hide();
  });

  const ret = globalShortcut.register('Command+Shift+V', () => {
    const cursorPosition = screen.getCursorScreenPoint();
    mainWindow?.setPosition(0, 0);

    const menu = getMenu();

    menu.on('menu-will-close', () => {
      mainWindow?.hide();
      tray?.setImage(icon);
    });

    menu.on('menu-will-show', () => {
      tray?.setImage(iconActive);
    });

    menu.popup({
      window: mainWindow!,
      x: cursorPosition.x,
      y: cursorPosition.y,
    });
  });

  if (!ret) {
    console.log('registration failed');
  }
};

const showSystemAccessibilityPrompt = () => {
  systemPreferences.isTrustedAccessibilityClient(true);
  const cursor = screen.getCursorScreenPoint();
  robot.moveMouse(cursor.x, cursor.y);
  // robot.typeString('');
  // clipboard.writeText(clipboard.readText());
}

app
  .whenReady()
  .then(() => {
    init();
    showSystemAccessibilityPrompt();
  })
  .catch(console.log);
