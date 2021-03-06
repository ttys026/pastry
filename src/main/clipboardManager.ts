import { clipboard, nativeImage, NativeImage } from 'electron';
import { isUri, safeParse, ocr } from './util';
import { get, set } from './store';

type Data = {
  text?: string;
  html?: string;
  image?: NativeImage;
  // for image only
  dataUrl?: string;
  ocr?: string;
} | null;

const isSameData = (a: Data, b: Data) => {
  if (a.text && typeof a.text === 'string') {
    return a.text === b.text && a.html === b.html;
  }
  if (a.image && b.image) {
    return a.image.getBitmap()?.equals(b.image?.getBitmap());
  }
  return false;
};

class ClipboardManager {
  private history: Data[] = [];
  private limit = 30;
  private isLock = false;
  private html = false;
  public updateTime = Date.now();

  constructor(props?: { html?: boolean; history?: Data[] }) {
    this.html = props?.html || false;
    this.history = (props.history || []).map((ele) => {
      if (ele.dataUrl) {
        return {
          ...ele,
          image: nativeImage.createFromDataURL(ele.dataUrl),
        };
      }
      return ele;
    });
  }

  private persist = () => {
    const storeData = this.history.map((ele) => {
      if (!ele.image) {
        return ele;
      }
      return {
        ...ele,
        dataUrl: ele.image.toDataURL(),
      };
    });
    set('history', JSON.stringify(storeData));
  };

  private readSpecificType = (type: string) => {
    switch (true) {
      case type.includes('/html') && this.html:
        return { type: 'html', value: clipboard.readHTML() };
      case type.includes('image/'):
        return { type: 'image', value: clipboard.readImage() };
      // TODO: GIF paste
      case type.includes('uri-list'): {
        const text = clipboard.readText();
        if (text) {
          return { type: 'text', value: text };
        }
        try {
          const dataUrl = clipboard.readImage().toDataURL();
          return {
            type: 'image',
            value: nativeImage.createFromDataURL(dataUrl),
          };
        } catch (e) {
          return { type: 'text', value: '' };
        }
      }
      default:
        return { type: 'text', value: clipboard.readText() };
    }
  };

  public ocrImage = async () => {
    const tasks = this.history.filter((ele) => {
      const needParse = ele.image && !ele.ocr;
      if (needParse) {
        ele.ocr = 'loading';
      }

      return needParse;
    });

    const ocrs = await Promise.all(
      tasks.map(async (ele) => {
        return {
          ...ele,
          ocr: await ocr(ele.image),
        };
      })
    );

    ocrs.forEach((ele) => {
      const found = this.history.findIndex((i) => isSameData(i, ele));
      if (found !== -1) {
        this.history[found].ocr = ele.ocr;
      }
    });
  };

  /**
   * retrieve the current clipboard data
   * @returns clipboard data
   */
  public retrieve() {
    const clipboardInfo: Data = {};
    const formats = clipboard.availableFormats();
    if (!formats.length) {
      return null;
    }
    // filter out custom type of clipboard data, eg: vscode-editor-data
    formats
      .filter((ele) => ele.includes('/'))
      .forEach((format) => {
        const { type, value } = this.readSpecificType(format);
        clipboardInfo[type] = value;
      });
    return clipboardInfo;
  }

  /**
   * add one item to the front
   * @param content
   */
  public add(content: Data) {
    if (this.isLock) {
      return;
    }
    const foundIndex = this.history.findIndex((ele) =>
      isSameData(ele, content)
    );
    if (foundIndex !== -1) {
      this.use(foundIndex);
      this.updateTime = Date.now();
      this.persist();
      return;
    }
    const length = this.history.unshift(content);
    if (length > this.limit) {
      this.history = this.history.slice(0, this.limit);
    }
    this.updateTime = Date.now();
    this.persist();
  }

  /**
   * get full history list
   * @returns
   */
  public getHistories() {
    return this.history;
  }

  /**
   * get history of different types
   * @returns
   */
  public getGroupedHistories(): { text: Data[]; image: Data[]; link: Data[] } {
    const history = { text: [], image: [], link: [] };
    for (let i = 0; i < this.history.length; i++) {
      const item = this.history[i];
      if (item.image) {
        history.image.push(item);
      } else if (isUri(item.text)) {
        history.link.push(item);
      } else {
        history.text.push(item);
      }
    }
    return history;
  }

  /**
   * get one item at index
   * @param index
   * @returns
   */
  public get(index: number) {
    return this.history[index];
  }

  /**
   * @deprecated get one item at index and move it to the front of the stack
   * @param index
   * @returns
   */
  public use(index: number) {
    const [item] = this.history.splice(index, 1);
    this.history.unshift(item);
    return item;
  }

  /**
   * refresh the stack
   */
  public refresh() {
    const currentClipboard = this.retrieve();
    if (currentClipboard) {
      this.add(currentClipboard);
    }
  }

  /**
   * clear stack
   */
  public clear() {
    this.history = [];
    set('history', '[]');
  }

  public lock() {
    this.isLock = true;
  }

  public unlock() {
    this.isLock = false;
  }
}

export const manager = new ClipboardManager({
  history: safeParse(get('history') || '', []),
});

export const initClipboardListener = () => {
  const listener = () => {
    const data = manager.retrieve();
    if (data) {
      manager.add(data);
    }
    manager.ocrImage();
  };

  const timer = setInterval(listener, 750);

  return () => {
    clearInterval(timer);
  };
};
