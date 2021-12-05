/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { createServer } from 'net';
import { app, powerMonitor } from 'electron';
import path from 'path';

class Deferred<T> {
  promise: Promise<T>;

  resolve!: (value: T | PromiseLike<T>) => void;

  reject!: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

const lockMap = new Map<string, Deferred<void>>();

let systemEvent: ChildProcessWithoutNullStreams;

// keep "System Events" alive to get quick response on copy and paste
const guard = () => {
  systemEvent = spawn(
    '/System/Library/CoreServices/System Events.app/Contents/MacOS/System Events'
  );
  systemEvent.on('exit', () => {
    console.error('system events quit', Date.now());
    guard();
    console.error('system events back again', Date.now());
  });
};

const osascript = spawn('osascript', ['-i'], {
  detached: false,
  stdio: ['pipe', 'ignore', 'ignore'],
  shell: false,
});

export const keepAlive = () => {
  guard();
  const activate = () => {
    console.log('try to renew');
    osascript.stdin.write(
      'tell application "System Events" to do shell script ""\n\n'
    );
  };
  activate();
  powerMonitor.on('unlock-screen', activate);
  const timer = setInterval(activate, 280000);
  return () => {
    powerMonitor.off('unlock-screen', activate);
    clearInterval(timer);
    systemEvent?.kill();
  };
};

let port = 0;
// osascript stdout does not flushed, therefore we create a tcp server to talk with osascript
const server = createServer((socket) => {
  socket.on('data', (chunk) => {
    const task = chunk.toString('utf8').trim();
    const lock = lockMap.get(task);
    console.log('work finished: ', task);
    lock.resolve();
    lockMap.delete(task);
    socket.end();
  });
}).listen(0, '127.0.0.1', () => {
  // @ts-ignore
  port = server.address().port;
});

const ensureAppleScriptExecuted = async (message: string) => {
  const timer = new Promise<void>((_, rej) => setTimeout(rej, 1000));
  const lock = new Deferred<void>();
  lockMap.set(message, lock);
  osascript.stdin.write(
    `do shell script "curl telnet://127.0.0.1:${port} <<< ${message}"\n\n`
  );
  return Promise.race([timer, lock.promise]);
};

export const copy = async () => {
  return new Promise<void>((res) => {
    osascript.stdin.write(
      'tell application "System Events" to keystroke "c" using command down\n\n',
      () => {
        const task = `copy${Date.now()}`;
        ensureAppleScriptExecuted(task)
          .catch(() => console.error(`${task} timeout`))
          .finally(res);
      }
    );
  });
};

export const paste = async () => {
  return new Promise<void>((res) => {
    osascript.stdin.write(
      'tell application "System Events" to keystroke "v" using command down\n\n',
      () => {
        const task = `paste${Date.now()}`;
        ensureAppleScriptExecuted(task)
          .catch(() => console.error(`${task} timeout`))
          .finally(res);
      }
    );
  });
};

export let resolveHtmlPath: (htmlFileName: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

const splitUri = (uri: string) => {
  var splitted = uri.match(
    /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/
  );
  return splitted;
};

export const isUri = (value: string) => {
  if (!value) {
    return false;
  }

  // check for illegal characters
  if (/[^a-z0-9\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\.\-\_\~\%]/i.test(value))
    return false;

  // check for hex escapes that aren't complete
  if (/%[^0-9a-f]/i.test(value)) return false;
  if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return false;

  const splitted = splitUri(value);
  const scheme = splitted[1];
  const authority = splitted[2];
  const path = splitted[3];

  // scheme and path are required, though the path can be empty
  if (!(scheme && scheme.length && path.length >= 0)) return false;

  // if authority is present, the path must be empty or begin with a /
  if (authority && authority.length) {
    if (!(path.length === 0 || /^\//.test(path))) return false;
  } else {
    // if authority is not present, the path must not start with //
    if (/^\/\//.test(path)) return false;
  }

  // scheme must begin with a letter, then consist of letters, digits, +, ., or -
  if (!/^[a-z][a-z0-9\+\-\.]*$/.test(scheme.toLowerCase())) return false;

  return true;
};

export const safeParse = <T>(str: string, initialValue?: T) => {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return initialValue;
  }
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};
