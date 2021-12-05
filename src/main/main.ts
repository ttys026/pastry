/* eslint global-require: off, no-console: off, promise/always-return: off */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  Menu,
  Tray,
  screen,
  globalShortcut,
  // systemPreferences,
} from 'electron';
import './controller';
import getMenu, { execScript } from './menu';
import { initClipboardListener, manager } from './clipboardManager';
import { resolveHtmlPath, keepAlive, getAssetPath, safeParse } from './util';
import { get } from './store';

let mainWindow: BrowserWindow | null = null;
let settingWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

require('electron-debug')();

const init = async () => {
  // const RESOURCES_PATH = app.isPackaged
  //   ? path.join(process.resourcesPath, 'assets')
  //   : path.join(__dirname, '../../assets');

  // const getAssetPath = (...paths: string[]): string => {
  //   return path.join(RESOURCES_PATH, ...paths);
  // };

  const iconActive = getAssetPath('icons/24x24.png');
  const icon = getAssetPath('icons/24x24-0.7.png');

  tray = new Tray(icon, '0');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Make Doughs', click: () => settingWindow?.show() },
    { type: 'separator' },
    { label: 'Clear Histories', click: () => manager.clear() },
    { type: 'separator' },
    {
      label: 'Quit Pastry',
      click: () => {
        settingWindow?.destroy();
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Pastry');
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
    minWidth: 800,
    minHeight: 600,
    icon: getAssetPath('icon.png'),
    title: 'Pastry',
    acceptFirstMouse: true,
    fullscreenable: false,
    resizable: true,
    simpleFullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const cancelClipboardListener = initClipboardListener();
  const killSystemEvent = keepAlive();

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    cancelClipboardListener();
    killSystemEvent();
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

  Array(10)
    .fill('')
    .forEach((_, index) => {
      globalShortcut.register(`Command+${index}`, () => {
        console.log('key press', index);
        const shortcuts = safeParse(get('shortcut'));
        const key = Object.entries(shortcuts).find(([, v]) => {
          return v === index;
        })?.[0];
        if (key) {
          execScript(key);
        }
        console.log('exec-script', index, key);
        // copy
      });
    });

  if (!ret) {
    console.log('registration failed');
  }
};

// const showSystemAccessibilityPrompt = () => {
//   systemPreferences.isTrustedAccessibilityClient(true);
// };

app
  .whenReady()
  .then(() => {
    init();
    // showSystemAccessibilityPrompt();
  })
  .catch(console.log);
