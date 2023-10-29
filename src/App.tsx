import "./App.css";
import { useInit } from "./hooks/useInit";
import { Input } from "antd";
import { manager } from "./utils/history";

function App() {
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

  return (
    <div className="container">
      <Input />
      <>
        {manager.list.map((ele, index) => {
          if (ele.type === "text") {
            return <div key={ele.time + ele.data + index}>{ele.data}</div>;
          } else {
            return <img src={ele.data} />;
          }
        })}
      </>
    </div>
  );
}

export default App;
