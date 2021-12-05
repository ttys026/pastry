import { Menu, clipboard } from 'electron';
import { manager } from './clipboardManager';
import { get } from './store';
import nanoid from 'nanoid';
import lodash from 'lodash';
import axios from 'axios';
import { copy, paste, safeParse, getAssetPath } from './util';

const injectedVariables = {
  // useful libs
  ...nanoid,
  _: lodash,
  lodash,
  axios,
  // banned for safety reason
  global: null,
  require: new ReferenceError('require is not defined'),
  process: new ReferenceError('process is not defined'),
};

const ellipsis = (content: string) => {
  return content.length > 20 ? content.slice(0, 19) + '...' : content;
};

const run = (content: string) =>
  new Function(
    ...Object.keys(injectedVariables),
    `return eval(${JSON.stringify(content)})`
  ).bind(Object.create(null), ...Object.values(injectedVariables));

interface Item {
  title: string;
  key: string;
  children: Item[];
}

export const execScript = async (key: string) => {
  manager.lock();
  const previous = manager.get(0);
  await copy();
  let selection = clipboard.readText();
  if (selection === previous) {
    selection = '';
  }
  try {
    const content = get(key) || '() => ""';
    const res = await run(content)()(selection);
    console.log('exec result', res);
    clipboard.writeText(res);
    paste();
    manager.unlock();
  } catch (e) {
    console.log('exec error', e);
    clipboard.writeText(e.message);
    await paste();
    clipboard.write(previous);
    manager.unlock();
  }
};

export default () => {
  const treeData: Item[] = safeParse(get('tree') || '[]', []);
  // flush stack

  const { text, image, link } = manager.getGroupedHistories();

  manager.refresh();

  const menu: any = [
    ...(!image.length && !text.length && !link.length
      ? [
          {
            enabled: false,
            label: '(空)',
          },
        ]
      : [
          {
            label: '粘贴最新',
            icon: getAssetPath('menuItems/paste.png'),
            click: paste,
          },
          { type: 'separator' },
        ]),
    { type: 'normal', label: '历史', enabled: false },
    text.length && {
      label: 'Texts',
      type: 'submenu',
      icon: getAssetPath('menuItems/text.png'),
      submenu: text.map((ele, index) => {
        const content = ele.text.trim();
        return {
          label: `${index + 1}. ${ellipsis(content)}`,
          click: () => {
            clipboard.write(ele);
            paste();
          },
          type: 'normal',
        };
      }),
    },
    link.length && {
      label: 'Links',
      type: 'submenu',
      icon: getAssetPath('menuItems/link.png'),
      submenu: link.map((ele, index) => {
        const content = ele.text.trim();
        return {
          label: `${index + 1}. ${ellipsis(content)}`,
          click: () => {
            clipboard.write(ele);
            paste();
          },
          type: 'normal',
        };
      }),
    },
    image.length && {
      label: 'Images',
      type: 'submenu',
      icon: getAssetPath('menuItems/image.png'),
      submenu: image.map((ele) => {
        const content = ele.image;
        const { width, height } = content.getSize();
        const isVertical = width < height;
        const x = Math.round(isVertical ? 0 : (width - height) / 2);
        const y = Math.round(isVertical ? (height - width) / 2 : 0);
        const dimension = isVertical ? width : height;
        const cropParams = { height: dimension, width: dimension, x, y };

        return {
          label: undefined,
          icon: content.crop(cropParams).resize({ width: 80 }),
          click: () => {
            clipboard.write(ele);
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
      label: ellipsis(folder.title),
      submenu: folder.children.map((file) => ({
        label: ellipsis(file.title),
        click: () => execScript(file.key),
      })),
    })),
  ];

  return Menu.buildFromTemplate(menu.filter(Boolean));
};
