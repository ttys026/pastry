import { clipboard } from 'electron';

class ClipboardManager {
  private history: string[] = [];
  private limit = 30;

  /**
   * add one item to the front
   * @param content 
   */
  public add(content: string){
    const foundIndex = this.history.findIndex(ele => ele === content);
    if (foundIndex !== -1) {
      this.use(foundIndex);
      return;
    }
    const length = this.history.unshift(content);
    if (length > this.limit) {
      this.history = this.history.slice(0, this.limit);
    }
  }

  /**
   * get full history list
   * @returns 
   */
  public getHistories() {
    return this.history;
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
    const currentClipboard = clipboard.readText();
    this.add(currentClipboard);
  }
}

export const manager = new ClipboardManager();

export const initClipboardListener = () => {
  const listener = () => {
    const currentClipboard = clipboard.readText();
    manager.add(currentClipboard);
  };
  const timer = setInterval(listener, 750);

  return () => {
    clearInterval(timer);
  }
}