interface ClipItem {
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
  limit = 100;
  constructor() {}
  public build({
    data,
    type,
  }: {
    data: string;
    type: "text" | "binary";
  }): ClipItem {
    return {
      data,
      type,
      category: "text",
      time: Date.now(),
    };
  }

  public ocr({ data, ocr }: { data: string; ocr: string }) {
    const found = this.list.find(
      (ele) => ele.data === data && ele.type === "binary"
    );
    if (found) {
      found.ocr = ocr;
    }
  }

  public add(item: ClipItem) {
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
  }
  public use(item: ClipItem) {
    const entry = this.list.findIndex((i) => isSame(i, item));
    // remove duplicate
    if (entry !== -1) {
      this.list.splice(entry, 1);
      this.list.unshift(item);
    }
  }
}

export const manager = new Manager();
