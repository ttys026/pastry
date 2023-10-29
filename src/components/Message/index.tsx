import { ClipItem } from "../../utils/history";
import { writeText, writeImage } from "tauri-plugin-clipboard-api";
import "./index.css";
import { hidePanelAndPaste } from "../../utils/paste";
import { useState } from "react";
import { CopyOutlined } from "@ant-design/icons";

function Message(props: ClipItem) {
  const [hover, setHover] = useState(false);
  const isText = props.type === "text";

  const paste = async () => {
    if (isText) {
      await writeText(props.data);
    } else {
      await writeImage(props.data);
    }
    hidePanelAndPaste();
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={"box" + (hover ? " hover" : "")}
      onClick={paste}
    >
      {hover && (
        <div className="actions">
          <div onClick={paste}>
            <CopyOutlined />
          </div>
        </div>
      )}
      {isText ? (
        <span>{props.data}</span>
      ) : (
        <>
          <img src={`data:image/png;base64,${props.data}`} />
          {!!props.ocr && <pre>{JSON.stringify(props.ocr)}</pre>}
        </>
      )}
    </div>
  );
}

export default Message;
