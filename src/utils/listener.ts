import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
  TEXT_CHANGED,
  IMAGE_CHANGED,
  listenToClipboard,
} from "tauri-plugin-clipboard-api";
import { ocr } from "./ocr";

let clipboardRegistering = false;

export interface ClipboardProps {
  onCopyImage: (base64: string) => void;
  onOcrImage: (params: { base64: string; text: string }) => void;
  onCopyText: (text: string) => void;
}

export const initClipboardListener = async (props: ClipboardProps) => {
  if (clipboardRegistering) {
    return () => {};
  }
  clipboardRegistering = true;
  const plugins: UnlistenFn[] = [];

  plugins.push(
    await listen(TEXT_CHANGED, (event) => {
      console.log(event);
      props.onCopyText((event.payload as any).value as string);
    })
  );
  plugins.push(
    await listen(IMAGE_CHANGED, async (event) => {
      console.log(event);
      const base64 = (event.payload as any).value;
      props.onCopyImage(base64);
      const text = await ocr(base64);
      props.onOcrImage({ base64, text });
    })
  );
  plugins.push(await listenToClipboard());
  clipboardRegistering = false;

  return () => {
    plugins.forEach((ele) => ele());
    clipboardRegistering = false;
  };
};
