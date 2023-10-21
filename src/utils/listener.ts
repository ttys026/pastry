import { register, unregister } from "@tauri-apps/api/globalShortcut";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import {
  TEXT_CHANGED,
  IMAGE_CHANGED,
  listenToClipboard,
} from "tauri-plugin-clipboard-api";
import { ocr } from "./ocr";
import { appWindow } from "@tauri-apps/api/window";

export interface ClipboardProps {
  onCopyImage: (base64: string) => void;
  onOcrImage: (params: { base64: string; text: string }) => void;
  onCopyText: (text: string) => void;
}

export const initShortcutListener = async () => {
  await register("Command+`", async () => {
    appWindow.setAlwaysOnTop(true);
    if (await appWindow.isVisible()) {
      appWindow.hide();
    } else {
      await appWindow.show();
      appWindow.setFocus();
    }
    console.log("Shortcut triggered");
  });

  return () => {
    unregister("Command+1");
  };
};

export const initClipboardListener = async (props: ClipboardProps) => {
  const plugins: UnlistenFn[] = [];

  plugins.push(
    await listen(TEXT_CHANGED, (event) => {
      console.log(event);
      props.onCopyText((event.payload as any).value as string);
    })
  );
  plugins.push(
    await listen(IMAGE_CHANGED, async (event) => {
      const base64 = (event.payload as any).value;
      props.onCopyImage(base64);
      const text = await ocr(base64);
      props.onOcrImage({ base64, text });
    })
  );
  plugins.push(await listenToClipboard());

  return () => {
    plugins.forEach((ele) => ele());
  };
};
