import { useDocumentVisibility, useMemoizedFn } from "ahooks";
import { useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";

export const useVisibleChange = (props: {
  onShow: () => void;
  onHide: () => void;
}) => {
  const state = useDocumentVisibility();
  const onShow = useMemoizedFn(props.onShow);
  const onHide = useMemoizedFn(props.onHide);

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
