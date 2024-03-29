/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import { app, NativeImage } from 'electron';
import { execFileSync } from 'child_process';
import { keyboard, Key } from '@nut-tree/nut-js';
import path, { join } from 'path';
import { writeFile, rmSync } from 'fs-extra';
import { tmpdir } from 'os';

const delay = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const copy = async () => {
  await keyboard.pressKey(Key.LeftSuper, Key.C);
  await keyboard.releaseKey(Key.LeftSuper, Key.C);
  await delay(64);
};

export const paste = async () => {
  await keyboard.pressKey(Key.LeftSuper, Key.V);
  await keyboard.releaseKey(Key.LeftSuper, Key.V);
};

export let resolveHtmlPath: (htmlFileName: string, search?: string) => string;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1212;
  resolveHtmlPath = (htmlFileName: string, search?: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    url.search = search;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string, search?: string) => {
    return `file://${path.resolve(
      __dirname,
      '../renderer/',
      htmlFileName
    )}?${search}`;
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

const RELEASE_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'release', 'lib')
  : path.join(__dirname, '../../release/lib');

export const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export const getReleasePath = (...paths: string[]): string => {
  return path.join(RELEASE_PATH, ...paths);
};

const activeApp = getReleasePath('activeApp');
const macocr = getReleasePath('macocr');

/**
 * use the binary from https://github.com/sindresorhus/active-win
 * @returns
 */
export const getActiveApp = () => {
  try {
    const active = execFileSync(activeApp, ['--no-screen-recording-permission']);
    const { owner } = JSON.parse(active.toString());
    return owner.path;
  } catch (e) {
    return '';
  }
};

// TODO: speed up for big image;
export const ocr = async (image: NativeImage) => {
  try {
    const tempName = join(tmpdir(), `pastry-${Math.random()}`);
    await writeFile(tempName, image.toPNG());
    const text = execFileSync(macocr, [tempName], { timeout: 0 }).toString('utf8');
    rmSync(tempName);
    console.log('done ocr with image', tempName, text);
    return text;
  } catch (e) {
    console.log('has error', e);
    return ''
  }
};
