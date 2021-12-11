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
  systemPreferences,
  shell,
} from 'electron';
import { log } from './controller';
import getMenu, { execScript } from './menu';
import { initClipboardListener, manager } from './clipboardManager';
import { resolveHtmlPath, getAssetPath, safeParse } from './util';
import { get, set } from './store';

let mainWindow: BrowserWindow | null = null;
export let settingWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

require('electron-debug')();

const init = async () => {
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
      contextIsolation: false,
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

  settingWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    shell.openExternal(url);
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
    const display = screen.getDisplayNearestPoint(cursorPosition);
    mainWindow?.setPosition(display.bounds.x, display.bounds.y);

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
        const shortcuts = safeParse(get('shortcut') || '{}', {});
        log('info', `shortcut pressed: command + ${index}`);
        const key = Object.entries(shortcuts).find(([, v]) => {
          return v === index;
        })?.[0];
        if (key && key !== 'undefined') {
          execScript(key);
        } else {
          log('error', `error: command + ${index} is not bound to any scripts`);
        }
      });
    });

  if (!ret) {
    console.log('registration failed');
  }
};

const showSystemAccessibilityPrompt = () => {
  const isTrusted = systemPreferences.isTrustedAccessibilityClient(false);
  if (!isTrusted) {
    systemPreferences.isTrustedAccessibilityClient(true);
  }
};

const addDemoFiles = () => {
  const initTreeData = [
    {
      title: 'demo',
      key: '0-0',
      children: [{ title: 'console.log', key: 'demo-0', isLeaf: true }],
    },
  ];
  const needInit = !get('init');
  if (needInit) {
    set('tree', JSON.stringify(initTreeData));
    set('shortcut', '{"demo-0":0}');
    set(
      'demo-0',
      `(selection, list, app) => {
  console.log(selection, list, app);
  return "Hello World";
}
`
    );
    set('init', 'true');
  }
};

app
  .whenReady()
  .then(() => {
    init();
    showSystemAccessibilityPrompt();
    addDemoFiles();
  })
  .catch(console.error);
