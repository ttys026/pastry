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
import { resolveHtmlPath, safeParse, initOcr } from './util';
import { get, set } from './store';
import { images } from './images';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
export let settingWindow: BrowserWindow | null = null;
export let searchWindow: BrowserWindow | null = null;
export let settingsInMemory = [];

export const showSearchWindow = () => {
  const cursorPosition = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPosition);
  searchWindow.setAlwaysOnTop(true, 'screen-saver');
  // display.workArea
  searchWindow.setBounds(display.workArea);
  searchWindow.show();
};

require('electron-debug')();

const getAutoLaunchState = () => {
  const { openAtLogin } = app.getLoginItemSettings();
  return openAtLogin;
};

const toggleAutoLaunch = () => {
  const enable = getAutoLaunchState();
  app.setLoginItemSettings({
    openAsHidden: true,
    openAtLogin: !enable,
  });
  buildTrayMenu();
};

const getSettings = () => {
  settingsInMemory = JSON.parse(get('settings') || '[]');
  return settingsInMemory;
};

const toggleSettings = (index: number) => {
  settingsInMemory[index] = !settingsInMemory[index];
  set('settings', JSON.stringify(settingsInMemory));
};

const buildTrayMenu = () => {
  const settings = getSettings();
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Make Doughs', click: () => settingWindow?.show() },
    { type: 'separator' },
    { label: 'Clear Histories', click: () => manager.clear() },
    { type: 'separator' },
    {
      type: 'submenu',
      label: 'Settings',
      submenu: [
        { label: 'Global Settings', enabled: false },
        {
          label: 'Launch at Startup',
          click: toggleAutoLaunch,
          type: 'checkbox',
          checked: getAutoLaunchState(),
        },
        { type: 'separator' },
        { label: 'Function Settings', enabled: false },
        {
          label: 'Enable Selection as Argument',
          click: () => toggleSettings(0),
          type: 'checkbox',
          checked: settings[0] || false,
        },
        {
          label: 'Enable Histroy as Argument',
          click: () => toggleSettings(1),
          type: 'checkbox',
          checked: settings[1] || false,
        },
        {
          label: 'Enable Active App as Argument',
          click: () => toggleSettings(2),
          type: 'checkbox',
          checked: settings[2] || false,
        },
      ],
    },
    { type: 'separator' },
    {
      label: 'Quit Pastry',
      click: () => {
        settingWindow?.destroy();
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(contextMenu);
};

const init = async () => {
  const icon = images.logo;

  tray = new Tray(icon, '0');

  buildTrayMenu();
  tray.setToolTip('Pastry');

  mainWindow = new BrowserWindow({
    show: false,
    paintWhenInitiallyHidden: true,
    x: 0,
    y: 0,
    simpleFullscreen: true,
    icon: images.logo,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: false,
  });

  searchWindow = new BrowserWindow({
    show: false,
    paintWhenInitiallyHidden: true,
    center: true,
    acceptFirstMouse: true,
    simpleFullscreen: true,
    useContentSize: true,
    icon: images.logo,
    frame: false,
    maximizable: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
    },
  });

  settingWindow = new BrowserWindow({
    show: false,
    paintWhenInitiallyHidden: true,
    center: true,
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    icon: images.logo,
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

  settingWindow.loadURL(resolveHtmlPath('index.html', 'setting'));
  searchWindow.loadURL(resolveHtmlPath('index.html'));

  settingWindow.on('show', () => {
    app.dock.show();
  });

  settingWindow.on('close', (e) => {
    e.preventDefault();
    settingWindow?.hide();
    app.dock.hide();
  });

  searchWindow.on('close', (e) => {
    e.preventDefault();
    searchWindow?.hide();
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
    });

    menu.popup({
      window: mainWindow!,
      x: cursorPosition.x - display.bounds.x,
      y: cursorPosition.y - display.bounds.y,
    });
  });

  globalShortcut.register('Command+`', () => {
    showSearchWindow();
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
  const needInit = !get('init');
  if (needInit) {
    set('settings', '[true, true, true]');
    const now = Date.now();
    const initTreeData = [
      {
        title: 'demo',
        key: '0-0',
        children: [{ title: 'console.log', key: `demo-${now}`, isLeaf: true }],
      },
    ];
    set('tree', JSON.stringify(initTreeData));
    set('shortcut', `{"demo-${now}":0}`);
    set(
      `demo-${now}`,
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
    initOcr();
  })
  .catch(console.error);
