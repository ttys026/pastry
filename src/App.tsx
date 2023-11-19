import { useInit } from "./hooks/useInit";
import { manager } from "./utils/history";
import { useEffect, useState } from "react";
import {
  LeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
} from "@ant-design/icons";
import Search from "./components/Search";
import Shortcut from "./components/ShortCut";
import Message from "./components/Message";
import { useKeyPress, useUpdate } from "ahooks";
import useMouseLock from "./hooks/useMouseLock";
import { moveDown, moveLeft, moveRight, moveUp } from "./utils/move";
import { invoke } from "@tauri-apps/api";

function App() {
  const update = useUpdate();
  const [active, setActive] = useState("0");
  const { mouseActiveChange, lockMouse } = useMouseLock(setActive);

  const scrollToIndexIfNecessary = (index: string) => {
    const element = document.querySelector(`[data-index="${index}"]`);
    if (element) {
      element.scrollIntoView({
        block: "nearest",
      });
    }
  };

  useInit({
    onCopyImage: (base64) => {
      manager.add(manager.build({ data: base64, type: "binary" }));
    },
    onCopyText: (text) => {
      manager.add(manager.build({ data: text, type: "text" }));
    },
    onOcrImage: ({ base64, text }) => {
      manager.ocr({ data: base64, ocr: text });
    },
  });

  useKeyPress(
    ["tab", "uparrow", "downarrow", "enter", "leftarrow", "rightarrow", "esc"],
    async (e) => {
      e.preventDefault();
      if (e.code === "Escape") {
        invoke("hide_spotlight");
        return;
      }
      if (e.code === "Enter") {
        const element = document.querySelector(`[data-index="${active}"]`);
        if (element) {
          (element as HTMLDivElement).click();
        }
        return;
      }
      if (e.code === "ArrowUp") {
        lockMouse();
        setActive((a) => {
          const next = moveUp(a, manager.list.length);
          scrollToIndexIfNecessary(next);
          return next;
        });
        return;
      }
      if (e.code === "ArrowLeft") {
        lockMouse();
        setActive((a) => {
          const next = moveLeft(a, manager.pins.length);
          scrollToIndexIfNecessary(next);
          return next;
        });
        return;
      }
      if (e.code === "ArrowRight") {
        lockMouse();
        setActive((a) => {
          const next = moveRight(a, manager.pins.length);
          scrollToIndexIfNecessary(next);
          return next;
        });
        return;
      }
      lockMouse();
      setActive((a) => {
        const next = moveDown(a, manager.list.length);
        scrollToIndexIfNecessary(next);
        return next;
      });
    }
  );

  useEffect(() => {
    return manager.listen(update);
  }, []);

  return (
    <div className="container">
      <Search
        onReset={() => {
          lockMouse();
          setActive("0");
        }}
      />
      <div className="info">
        使用 &nbsp;
        <LeftOutlined />
        <RightOutlined />
        &nbsp; 切换快捷方式
      </div>
      <Shortcut
        active={active}
        mouseActive={mouseActiveChange}
        keyboardActive={setActive}
      />
      <div className="info">
        使用 &nbsp;
        <UpOutlined />
        <DownOutlined />
        &nbsp; 切换历史记录
      </div>
      <div className="scroller">
        {manager.list.map((ele, index) => {
          const key = index.toString();
          return (
            <Message
              {...ele}
              index={key}
              isActive={key === active}
              setActive={mouseActiveChange}
              key={ele.time + ele.data + index}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
