import { Menu, clipboard } from 'electron';
import { manager } from './clipboardManager';
import { get } from './store';
import { run } from './runner';
import { copy, paste, safeParse, getActiveApp } from './util';
import { log } from './controller';
import { settingsInMemory, showSearchWindow } from './main';
import { images } from './images';


const ellipsis = (content: string) => {
  return content.length > 20 ? content.slice(0, 19) + '...' : content;
};

interface Item {
  title: string;
  key: string;
  children: Item[];
}

export const execScript = async (key: string) => {
  const settings = settingsInMemory;
  manager.lock();
  let selection = '';
  let list = [];
  let active = '';
  let previous = null;
  if (settings[0]) {
    previous = manager.get(0);
    await copy();
    selection = clipboard.readText();
    if (selection === previous?.text) {
      selection = '';
    }
  }
  if (settings[1]) {
    list = manager.getHistories();
  }
  if (settings[2]) {
    active = getActiveApp();
  }

  settings[0] && log('info', `current selection: `, selection);
  try {
    const content = get(key) || '() => ""';
    const script = await run(content);
    settings[2] && log('info', `current active app: `, active);
    const res = (await script(selection, list, active)).toString();
    log('info', `function execute succeed with response: `, res);
    clipboard.writeText(res || '');
    paste();
    manager.unlock();
  } catch (e) {
    log('info', `function execute failed with error: `, e);
    clipboard.writeText(e.message || 'Execute Failed');
    await paste();
    if (settings[0]) {
      clipboard.write(previous);
    }
    manager.unlock();
  }
};

export default () => {
  const treeData: Item[] = safeParse(get('tree') || '[]', []);
  // flush stack

  const { text, image, link } = manager.getGroupedHistories();

  manager.refresh();

  const menu: any = [
    {
      label: '搜索',
      icon: images.search,
      click: () => showSearchWindow(),
    },
    ...(!image.length && !text.length && !link.length
      ? []
      : [
          {
            label: '粘贴最新',
            icon: images.paste,
            click: paste,
          },
          { type: 'separator' },
        ]),
    { type: 'normal', label: '历史', enabled: false },
    text.length && {
      label: 'Texts',
      type: 'submenu',
      icon: images.text,
      submenu: text.map((ele, index) => {
        const content = ele.text.trim();
        return {
          label: `${index + 1}. ${ellipsis(content)}`,
          click: () => {
            clipboard.write(ele);
            log('info', 'paste text: ', ele.text);
            paste();
          },
          type: 'normal',
        };
      }),
    },
    link.length && {
      label: 'Links',
      type: 'submenu',
      icon: images.link,
      submenu: link.map((ele, index) => {
        const content = ele.text.trim();
        return {
          label: `${index + 1}. ${ellipsis(content)}`,
          click: () => {
            clipboard.write(ele);
            log('info', 'paste link: ', ele.text);
            paste();
          },
          type: 'normal',
        };
      }),
    },
    image.length && {
      label: 'Images',
      type: 'submenu',
      icon: images.image,
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
            log('info', 'paste image: <Binary ...>');
            paste();
          },
          type: 'normal',
        };
      }),
    },
    { type: 'separator' },
    {
      label: 'Clear Histories',
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
