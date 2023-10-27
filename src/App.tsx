import { useState } from "react";
import "./App.css";
import { useInit } from "./hooks/useInit";
import { hidePanelAndPaste } from "./utils/paste";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  useInit({
    onCopyImage: () => setGreetMsg("img copied"),
    onCopyText: (text) => setGreetMsg(text),
    onOcrImage: ({ text }) => setGreetMsg(JSON.stringify(text)),
  });

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <input />
      <button onClick={hidePanelAndPaste} type="submit">
        Greet
      </button>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
