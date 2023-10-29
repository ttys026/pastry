import { useDocumentVisibility, useMemoizedFn } from "ahooks";
import { useEffect } from "react";

export const useVisibleChange = (props: {
  onShow: () => void;
  onHide: () => void;
}) => {
  const state = useDocumentVisibility();
  const onShow = useMemoizedFn(props.onShow);
  const onHide = useMemoizedFn(props.onHide);

  useEffect(() => {
    if (state === "visible") {
      onShow();
    }
    if (state === "hidden") {
      onHide();
    }
  }, [state]);
};
