import { invoke } from "@tauri-apps/api/tauri";
import { useMount, useRequest, useUnmount } from "ahooks";

import { ClipboardProps, initClipboardListener } from "../utils/listener";

export const useInit = (props: ClipboardProps) => {
  const clipboard = useRequest(() => initClipboardListener(props));

  useMount(() => {
    invoke("init_spotlight_window");
    if (process.env.NODE_ENV !== "development") {
      document.addEventListener("contextmenu", (event) =>
        event.preventDefault()
      );
      document.addEventListener("contextmenu", (event) =>
        event.preventDefault()
      );
    }
  });

  const unmount = () => {
    clipboard.data?.();
  };

  useUnmount(unmount);
};
