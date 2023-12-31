import React, { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  onSortEnd?: (oldIndex: number, newIndex: number) => void;
  direction?: "vertical" | "horizontal";
}

const createClone = (element: HTMLElement) => {
  const styles = getComputedStyle(element);
  const clone = element.cloneNode(true) as HTMLElement;
  Array.from(styles).forEach((key) =>
    clone.style.setProperty(
      key,
      styles.getPropertyValue(key),
      styles.getPropertyPriority(key)
    )
  );
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
  document.body.appendChild(clone);
  return {
    element: clone,
    destroy: () => clone.remove(),
  };
};

const setDraggingShadow = (params: {
  origin: HTMLElement;
  clone: HTMLElement;
  e: React.DragEvent<HTMLDivElement>;
}) => {
  const { origin, clone, e } = params;
  const { left, top } = origin.getBoundingClientRect();
  e.dataTransfer.setDragImage(clone, e.clientX - left, e.clientY - top);
};

export const Sortable: React.FC<Props> = (props) => {
  const { direction = "vertical" } = props;

  const draggingIndex = useRef(-1);
  const draggingEle = useRef<HTMLDivElement | null>(null);
  const lastEnterElement = useRef<HTMLDivElement | null>(null);
  const lastEnterRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    document.addEventListener("dragover", (e) => {
      if (
        !draggingEle.current ||
        !lastEnterElement.current ||
        !lastEnterRect.current ||
        draggingIndex.current === -1
      ) {
        return;
      }
      e.preventDefault();
      const getMousePosition = () =>
        direction === "horizontal" ? e.clientX : e.clientY;
      const { left, width, top, height } = lastEnterRect.current;
      const getElementPos = () =>
        direction === "horizontal" ? left + width / 2 : top + height / 2;
      if (getMousePosition() > getElementPos()) {
        lastEnterElement.current.insertAdjacentElement(
          "afterend",
          draggingEle.current!
        );
      } else {
        lastEnterElement.current.insertAdjacentElement(
          "beforebegin",
          draggingEle.current!
        );
      }
    });
  }, []);

  return (
    <>
      {React.Children.map(props.children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            ...child.props,
            draggable: true,
            onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
              draggingIndex.current = index;
              draggingEle.current = e.currentTarget as HTMLDivElement;
              const clone = createClone(draggingEle.current);
              setDraggingShadow({
                origin: draggingEle.current,
                clone: clone.element,
                e,
              });
              requestAnimationFrame(clone.destroy);
              draggingEle.current.style.opacity = "0";
            },
            onDragEnd: () => {
              if (draggingEle.current) {
                const parent = draggingEle.current.parentElement;
                draggingEle.current.style.opacity = "";
                if (parent) {
                  const newIndex = Array.prototype.indexOf.call(
                    parent.children,
                    draggingEle.current
                  );
                  props.onSortEnd?.(draggingIndex.current, newIndex);
                }
              }
              draggingEle.current = null;
              draggingIndex.current = -1;
            },
            onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
              const target = e.currentTarget as HTMLDivElement;
              lastEnterElement.current = target;
              lastEnterRect.current = target.getBoundingClientRect();
            },
          });
        }
        return child;
      })}
    </>
  );
};
