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
  list: ClipItem[] = [];
  private limit = 100;
  private callbacks: (() => void)[] = [];

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
    const found = this.list.find(
      (ele) => ele.data === data && ele.type === "binary"
    );
    if (found) {
      found.ocr = ocr;
      this.notify();
    }
  };

  public add = (item: ClipItem) => {
    const duplicateEntry = this.list.findIndex((i) => isSame(i, item));
    // remove duplicate
    if (duplicateEntry !== -1) {
      this.list.splice(duplicateEntry, 1);
    }
    // pop out latest
    if (this.list.length > this.limit) {
      this.list.pop();
    }
    this.list.unshift(item);
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
