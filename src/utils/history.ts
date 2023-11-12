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

class Manager {
  private _list: ClipItem[] = [];
  private _pins: (ClipItem & { title: string })[] = [
    {
      title: "引用类型",
      type: "text",
      data: `import styles from './index.module.scss';`,
      time: 0,
    },
    {
      title: "单测初始化",
      type: "text",
      data: `import React from 'react';
import Comp from '..';
import { render } from '@testing-library/react';

describe('comp', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });
  it('should render', () => {
    const { container } = render(<Comp />);
    expect(container.children).toMatchSnapshot();
  });
});
`,
      time: 0,
    },
    {
      title: "Model 初始化",
      type: "text",
      data: `import { createContainer } from 'unstated-next';

export const _useContainer = () => {
  return {};
};

export const PageModel = createContainer(_useContainer);
`,
      time: 0,
    },
    {
      title: "React 初始化",
      type: "text",
      data: [
        "import React from 'react'",
        "",
        "interface Props {}",
        "",
        "export default (props: Props) => {",
        "  return <div>123</div>;",
        "};",
        "",
      ].join("\n"),
      time: 0,
    },
  ];
  private keyword = "";
  private limit = 100;
  private callbacks: (() => void)[] = [];

  public get list() {
    return this._list.filter((ele) => {
      return new RegExp(this.keyword, "i").test(ele.ocr || ele.data);
    });
  }

  public get pins() {
    return this._pins.filter((ele) => {
      const regex = new RegExp(this.keyword, "i");
      return regex.test(ele.title) || regex.test(ele.ocr || ele.data);
    });
  }

  constructor() {}

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
}

export const manager = new Manager();
