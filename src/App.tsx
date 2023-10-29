import { useInit } from "./hooks/useInit";
import { manager } from "./utils/history";
import { useEffect, useState } from "react";
import Search from "./components/Search";
import Message from "./components/Message";

function App() {
  const [key, setKey] = useState(0);

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

  useEffect(() => {
    return manager.listen(() => {
      setKey((k) => k + 1);
    });
  }, []);

  return (
    <div className="container">
      <Search />
      <div key={key}>
        {manager.list.map((ele, index) => {
          return <Message {...ele} key={ele.time + ele.data + index} />;
        })}
      </div>
    </div>
  );
}

export default App;
