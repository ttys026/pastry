import { Menu, clipboard } from 'electron';
import robot from 'robotjs';
import { manager } from './clipboardManager';
import { get } from './store';
import { nanoid } from 'nanoid';
import lodash from 'lodash';
import axios from 'axios';

const injectedVariables = {
  // useful libs
  nanoid,
  _: lodash,
  lodash,
  axios,
  // banned for safety reason
  global: null,
  require: new ReferenceError('require is not defined'),
  process: new ReferenceError('process is not defined'),
};

const run = (content: string) =>
  new Function(
    ...Object.keys(injectedVariables),
    `return eval(${JSON.stringify(content)})`
  ).bind(null, ...Object.values(injectedVariables));

interface Item {
  title: string;
  key: string;
  children: Item[];
}

const copy = async () => {
  return new Promise((res) => {
    robot.keyTap('c', 'command');
    setImmediate(res);
  });
};

const paste = async () => {
  // await new Promise((res) => {
  //   setImmediate(res);
  // });
  robot.keyTap('v', 'command');
};

export default () => {
  const treeData: Item[] = JSON.parse(get('tree') || '[]');
  // flush stack
  manager.refresh();
  return Menu.buildFromTemplate([
    { type: 'normal', label: '历史', enabled: false },
    {
      label: 'history',
      type: 'submenu',
      submenu: manager.getHistories().map((ele, index) => {
        const content = ele.trim();
        return {
          label: `${index + 1}. ${
            content.length > 20 ? content.slice(0, 19) + '...' : content
          }`,
          click: () => {
            clipboard.writeText(ele);
            paste();
          },
          type: 'normal',
        };
      }),
    },
    { type: 'separator' },
    {
      label: 'clear history',
      click: () => {
        clipboard.clear();
        manager.clear();
      },
    },
    { type: 'separator' },
    { type: 'normal', label: '脚本', enabled: false },
    ...treeData.map((folder) => ({
      label: folder.title,
      submenu: folder.children.map((file) => ({
        label: file.title,
        click: async () => {
          manager.lock();
          const previous = manager.get(0);
          await copy();
          let selection = clipboard.readText();
          if (selection === previous) {
            selection = '';
          }
          try {
            const content = get(file.key) || '() => ""';
            const res = await run(content)()(selection);
            console.log('exec result', res);
            clipboard.writeText(res);
            manager.unlock();
            paste();
          } catch (e) {
            console.log('exec error', e);
            manager.unlock();
            clipboard.writeText(previous);
          }
        },
      })),
    })),
  ]);
};
