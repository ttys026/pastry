/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import { app } from 'electron';
import { keyboard, Key } from '@nut-tree/nut-js';
import path from 'path';

const delay = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const copy = async () => {
  await keyboard.pressKey(Key.LeftSuper, Key.C);
  await keyboard.releaseKey(Key.LeftSuper, Key.C);
  await delay(32);
};

export const paste = async () => {
  await keyboard.pressKey(Key.LeftSuper, Key.V);
  await keyboard.releaseKey(Key.LeftSuper, Key.V);
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
