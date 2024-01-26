import { useEffect, useRef } from "react";
import { writeImage, writeText } from "tauri-plugin-clipboard-api";
import { manager } from "@/utils/history";
import { Sortable } from "../Sortable";
import { hidePanelAndPaste } from "@/utils/paste";
import "./index.css";
import { useContextMenu } from "@/hooks/useContextMenu";
import { noop } from "@/utils/promise";

function Shortcut(props: {
  lockMouse: () => void;
  active: string;
  mouseActive: (active: React.SetStateAction<string>) => void;
  keyboardActive: (active: React.SetStateAction<string>) => void;
  onEdit: (i: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useContextMenu(ref, {
    onEdit: (i) => {
      props.onEdit(-i);
    },
    onDelete: (i) => {
      manager.removePin(-i);
    },
  });

  useEffect(() => {
    let onScroll = noop;
    manager.ready.then(() => {
      const left = document.querySelector(".shadow-left") as HTMLDivElement;
      const right = document.querySelector(".shadow-right") as HTMLDivElement;

      if (left && right && ref.current) {
        onScroll = () => {
          if (!ref.current) {
            return;
          }
          const distance = ref.current.scrollWidth - ref.current.offsetWidth;
          if (distance === 0) {
            return;
          }
          const ratio = ref.current.scrollLeft / distance;
          left.style.opacity = `${ratio}`;
          right.style.opacity = `${1 - ratio}`;
        };
        ref.current.addEventListener("scroll", onScroll, { passive: true });
        requestAnimationFrame(() => {
          onScroll();
        });
      }
    });

    return () => {
      if (ref.current) {
        ref.current.removeEventListener("scroll", onScroll);
      }
    };
  }, []);

  return (
    <div className="shortcut">
      <div ref={ref} className="inner">
        <div className="shadow shadow-left"></div>
        <div className="shadow shadow-right"></div>
        <div style={{ display: "flex" }}>
          <Sortable
            onSortEnd={(oldIndex, newIndex) => {
              props.lockMouse();
              manager.movePin(oldIndex, newIndex);
              props.keyboardActive(`-${newIndex}`);
            }}
            direction="horizontal"
          >
            {manager.pins.map((ele, index) => {
              const key = `-${index}`;
              const isText = ele.type === "text";
              const paste = async () => {
                if (isText) {
                  await writeText(ele.data);
                } else {
                  await writeImage(ele.data);
                }
                hidePanelAndPaste();
              };

              return (
                <div
                  onClick={paste}
                  onMouseMove={() => {
                    props.mouseActive(key);
                  }}
                  key={`${key}-${ele.title}`}
                  data-index={key}
                  className={
                    "shortcutItem" + (props.active === key ? " hover" : "")
                  }
                >
                  {ele.title}
                </div>
              );
            })}
          </Sortable>
        </div>
      </div>
    </div>
  );
}

export default Shortcut;
