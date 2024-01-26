import { useInit } from "./hooks/useInit";
import { manager } from "./utils/history";
import { useState } from "react";
import { Tabs } from "antd";
import BookMark from "./features/BookMark";
import PasteBoard from "./features/PasteBoard/App";
import { useKeyPress } from "ahooks";
import { invoke } from "@tauri-apps/api/tauri";
import Script from "./features/Script";

const tabs = [
  { label: "PasteBoard(⌘+1)", key: "0", component: <PasteBoard /> },
  { label: "BookMarks(⌘+2)", key: "1", component: <BookMark /> },
  { label: "Scripts(⌘+3)", key: "2", component: <Script /> },
];

function App() {
  const [tab, setTab] = useState("0");

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

  useKeyPress(["tab", "esc", "meta.1", "meta.2", "meta.3"], async (e) => {
    e.preventDefault();
    if (e.code === "Escape") {
      invoke("hide_spotlight");
      return;
    }
    if (e.code === "Tab") {
      setTab((t) => (Number(t) < tabs.length - 1 ? `${Number(t) + 1}` : "0"));
      return;
    }
    if (Number.isInteger(Number(e.key)) && e.metaKey) {
      setTab(`${Number(e.key) - 1}`);
    }
  });

  return (
    <div className="container">
      <Tabs
        items={tabs}
        animated={false}
        onChange={setTab}
        activeKey={tab}
        type="editable-card"
      />
      <div className="content">
        {tabs.find((ele) => ele.key === tab)?.component}
      </div>
    </div>
  );
}

export default App;
