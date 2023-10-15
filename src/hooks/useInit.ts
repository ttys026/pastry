import { useRequest, useUnmount } from "ahooks";
import {
  ClipboardProps,
  initClipboardListener,
  initShortcutListener,
} from "../utils/listener";

export const useInit = (props: ClipboardProps) => {
  const clipboard = useRequest(() => initClipboardListener(props));
  const shortcut = useRequest(() => initShortcutListener());

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
