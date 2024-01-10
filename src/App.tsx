import { useInit } from "./hooks/useInit";
import { manager } from "./utils/history";
import { useEffect, useRef, useState } from "react";
import {
  LeftOutlined,
  RightOutlined,
  UpOutlined,
  DownOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import Search from "./components/Search";
import Shortcut from "./components/ShortCut";
import Message from "./components/Message";
import { useKeyPress, useUpdate } from "ahooks";
import useMouseLock from "./hooks/useMouseLock";
import { moveDown, moveLeft, moveRight, moveUp } from "./utils/move";
import { invoke } from "@tauri-apps/api/tauri";
import AddPin from "./components/AddPin";
import { Tabs } from "antd";
import BookMark from "./features/BookMark";

function App() {
  const update = useUpdate();
  const [active, setActive] = useState("0");
  const [tab, setTab] = useState("0");
  const [addVisible, setAddVisible] = useState(false);
  const editIndex = useRef(0);
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
      if (e.code === "Tab") {
        lockMouse();
        setTab((t) => (t === "0" ? "1" : "0"));
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
    return manager.listen(() => {
      console.info("manager change");
      update();
    });
  }, []);

  return (
    <div className="container">
      <Tabs
        items={[
          { label: "PasteBoard", key: "0" },
          { label: "BookMarks", key: "1" },
        ]}
        animated={false}
        onChange={setTab}
        activeKey={tab}
        type="editable-card"
      />
      {tab === "0" && (
        <div className="content">
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
            <PlusCircleOutlined
              onClick={() => {
                editIndex.current = NaN;
                setAddVisible(true);
              }}
              style={{ marginLeft: "8px" }}
            />
            {addVisible && (
              <AddPin
                index={editIndex.current}
                visible={addVisible}
                onChange={setAddVisible}
              />
            )}
          </div>
          <Shortcut
            active={active}
            lockMouse={lockMouse}
            mouseActive={mouseActiveChange}
            keyboardActive={setActive}
            onEdit={(index) => {
              editIndex.current = index;
              setAddVisible(true);
            }}
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
      )}
      {tab === "1" && (
        <div className="content">
          <BookMark />
        </div>
      )}
    </div>
  );
}

export default App;
