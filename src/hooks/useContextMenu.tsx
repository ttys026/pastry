import { Menu } from "antd";
import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";

const noop = () => {};

export const useContextMenu = (
  ref: React.RefObject<HTMLDivElement>,
  {
    onEdit,
    onDelete,
  }: { onEdit: (i: string) => void; onDelete: (i: string) => void }
) => {
  const close = useRef(noop);
  const lock = useRef(false);

  useEffect(() => {
    if (ref.current) {
      const onContextMenu = (e: MouseEvent) => {
        const path = e.composedPath();
        const target = path.find((ele) =>
          (ele as HTMLDivElement).getAttribute("data-index")
        );
        if (!target) {
          return;
        }
        const index = (target as HTMLDivElement).getAttribute("data-index")!;
        close.current();
        e.preventDefault();
        const el = document.createElement("div");
        el.style.position = "fixed";
        el.style.width = "100vw";
        el.style.height = "100vh";
        el.onclick = () => {
          if (!lock.current) {
            close.current();
          }
        };
        el.oncontextmenu = (e) => {
          e.preventDefault();
          close.current();
        };
        document.body.append(el);
        const width = 80;
        const buffer = 20;
        const left =
          e.clientX + width > innerWidth - buffer ? e.clientX - 80 : e.clientX;
        ReactDOM.render(
          <div
            style={{
              position: "relative",
              top: `${e.clientY}px`,
              left: `${left}px`,
            }}
          >
            <Menu
              items={[
                {
                  key: "1",
                  label: "修改",
                  style: { margin: 0, width: "100%", borderRadius: 0 },
                  onMouseEnter: () => (lock.current = true),
                  onMouseLeave: () => (lock.current = false),
                  onClick: () => {
                    onEdit(index);
                    close.current();
                  },
                },
                {
                  key: "3",
                  label: "删除",
                  danger: true,
                  style: { margin: 0, width: "100%", borderRadius: 0 },
                  onMouseEnter: () => (lock.current = true),
                  onMouseLeave: () => (lock.current = false),
                  onClick: () => {
                    onDelete(index);
                    close.current();
                  },
                },
              ]}
              style={{ width, padding: 0 }}
            />
          </div>,
          el
        );

        close.current = () => {
          ReactDOM.unmountComponentAtNode(el);
          el.onclick = null;
          el.oncontextmenu = null;
          el.remove();
        };
      };
      ref.current.addEventListener("contextmenu", onContextMenu);
      return () => {
        if (ref.current) {
          ref.current.removeEventListener("contextmenu", onContextMenu);
        }
      };
    }
  }, []);

  return ref;
};
