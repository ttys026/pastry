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

  console.log("????", clipboard);

  useMount(() => {
    console.log("mount");
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
    console.info("unmount", clipboard, shortcut);
  };

  useUnmount(unmount);
};
