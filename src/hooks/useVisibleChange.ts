import { useDocumentVisibility, useMemoizedFn } from "ahooks";
import { useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";

const noop = () => {};

export const useVisibleChange = (props: {
  onShow?: () => void;
  onHide?: () => void;
}) => {
  const state = useDocumentVisibility();
  const onShow = useMemoizedFn(props.onShow || noop);
  const onHide = useMemoizedFn(props.onHide || noop);

  useEffect(() => {
    if (state === "visible") {
      appWindow.center();
      onShow();
    }
    if (state === "hidden") {
      onHide();
    }
  }, [state]);
};
