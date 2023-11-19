import { invoke } from "@tauri-apps/api/tauri";
import { appWindow } from "@tauri-apps/api/window";
import { useMount, useRequest, useUnmount } from "ahooks";
// import { hide } from "tauri-plugin-spotlight-api";
import {
  ClipboardProps,
  initClipboardListener,
  initShortcutListener,
} from "../utils/listener";

export const useInit = (props: ClipboardProps) => {
  const clipboard = useRequest(() => initClipboardListener(props));
  const shortcut = useRequest(() => initShortcutListener());

  useMount(() => {
    invoke("init_spotlight_window");
    // hide();
    // document.addEventListener("contextmenu", (event) => event.preventDefault());
    // document.addEventListener("contextmenu", (event) => event.preventDefault());
  });

  const unmount = () => {
    if (!clipboard.loading) {
      clipboard.data?.();
    }

    if (!shortcut.loading) {
      shortcut.data?.();
    }
  };

  useUnmount(unmount);
};
