import { STORE_KEY, storage } from "./storage";

export interface ClipItem {
  data: string;
  type: "text" | "binary";
  ocr?: string;
  category?: "link" | "text" | "image";
  time: number;
}

const isSame = (a: ClipItem, b: ClipItem) => {
  if (a === b) {
    return true;
  }
  if (a.data === b.data) {
    return true;
  }
  return false;
};

// const defaultPins = [
//   {
//     title: "引用类型",
//     type: "text",
//     data: `import styles from './index.module.scss';`,
//     time: 0,
//   },
//   {
//     title: "单测初始化",
//     type: "text",
//     data: `import React from 'react';
// import Comp from '..';
// import { render } from '@testing-library/react';

// describe('comp', () => {
// beforeAll(() => {
//   jest.useFakeTimers();
// });
// afterAll(() => {
//   jest.useRealTimers();
// });
// it('should render', () => {
//   const { container } = render(<Comp />);
//   expect(container.children).toMatchSnapshot();
// });
// });
// `,
//     time: 0,
//   },
//   {
//     title: "Model 初始化",
//     type: "text",
//     data: `import { createContainer } from 'unstated-next';

// export const _useContainer = () => {
// return {};
// };

// export const PageModel = createContainer(_useContainer);
// `,
//     time: 0,
//   },
//   {
//     title: "React 初始化",
//     type: "text",
//     data: [
//       "import React from 'react'",
//       "",
//       "interface Props {}",
//       "",
//       "export default (props: Props) => {",
//       "  return <div>123</div>;",
//       "};",
//       "",
//     ].join("\n"),
//     time: 0,
//   },
// ];

class Manager {
  private _list: ClipItem[] = [];
  private _pins: (ClipItem & { title: string })[] = [];
  private keyword = "";
  private limit = 100;
  private callbacks: (() => void)[] = [];

  public get list() {
    return this._list.filter((ele) => {
      return new RegExp(this.keyword, "i").test(ele.ocr || ele.data);
    });
  }

  public get pins() {
    return this._pins;
  }

  constructor() {
    const init = async () => {
      this._list = JSON.parse(await storage.get(STORE_KEY.HISTORY));
      this._pins = JSON.parse(await storage.get(STORE_KEY.PINS));
      this.notify();
    };

    init().catch(console.error);
  }

  private notify = () => {
    this.callbacks.forEach((ele) => ele());
  };

  public build = ({
    data,
    type,
  }: {
    data: string;
    type: "text" | "binary";
  }): ClipItem => {
    return {
      data,
      type,
      category: "text",
      time: Date.now(),
    };
  };

  public ocr = ({ data, ocr }: { data: string; ocr: string }) => {
    const found = this._list.find(
      (ele) => ele.data === data && ele.type === "binary"
    );
    if (found) {
      found.ocr = ocr;
      this.notify();
    }
  };

  public add = (item: ClipItem) => {
    const duplicateEntry = this._list.findIndex((i) => isSame(i, item));
    // remove duplicate
    if (duplicateEntry !== -1) {
      this._list.splice(duplicateEntry, 1);
    }
    // pop out latest
    if (this._list.length > this.limit) {
      this._list.pop();
    }
    this._list.unshift(item);
    storage.set(STORE_KEY.HISTORY, JSON.stringify(this._list));
    this.notify();
  };

  public search = (keyword: string) => {
    this.keyword = keyword;
    this.notify();
  };

  public listen = (cb: () => void) => {
    this.callbacks.push(cb);

    return () => {
      this.callbacks.splice(this.callbacks.indexOf(cb), 1);
    };
  };

  public movePin = (oldIndex: number, newIndex: number) => {
    this._pins.splice(newIndex, 0, this._pins.splice(oldIndex, 1)[0]);
    storage.set(STORE_KEY.PINS, JSON.stringify(this._pins));
  };

  public removePin = (index: number) => {
    this._pins.splice(index, 1);
    storage.set(STORE_KEY.PINS, JSON.stringify(this._pins));
    this.notify();
  };

  public addPin = ({ title, data }: { title: string; data: string }) => {
    this._pins.push({
      title,
      data,
      type: "text",
      time: 0,
    });
    storage.set(STORE_KEY.PINS, JSON.stringify(this._pins));
    this.notify();
  };

  public editPin = ({
    title,
    data,
    index,
  }: {
    title: string;
    data: string;
    index: number;
  }) => {
    this._pins[index] = {
      ...this._pins[index],
      title,
      data,
    };
    storage.set(STORE_KEY.PINS, JSON.stringify(this._pins));
    this.notify();
  };
}

export const manager = new Manager();
