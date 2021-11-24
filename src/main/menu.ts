import { Menu, clipboard } from 'electron';
import robot from 'robotjs';
import { manager } from './clipboardManager';

const copy = async () => {
  return new Promise((res) => {
    robot.keyTap('c', 'command');
    setImmediate(res);
  });
};

const paste = async () => {
  await new Promise((res) => {
    setImmediate(res);
  });
  robot.keyTap('v', 'command');
};

const mockText = `(selection) => { return selection.slice(0,3) }`;

export default () => {
  // flush stack
  manager.refresh();
  return Menu.buildFromTemplate([
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
      label: 'dough',
      submenu: [
        {
          label: 'slice',
          click: async () => {
            const previous = manager.get(0);
            await copy();
            const selection = clipboard.readText();
            try {
              const res = await eval(mockText)(selection);
              clipboard.writeText(res);
              paste();
            } catch (e) {
              clipboard.writeText(previous);
            }
          },
        },
      ],
    },
  ]);
};
