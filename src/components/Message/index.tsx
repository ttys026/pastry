import { ClipItem } from "../../utils/history";
import { writeText, writeImage } from "tauri-plugin-clipboard-api";
import { hidePanelAndPaste } from "../../utils/paste";
import { useState } from "react";
import { CopyOutlined } from "@ant-design/icons";
import TimeAgo from "../TimeAgo";
import "./index.css";

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

  const pasteOcr = async () => {
    await writeText(props.ocr || "");
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
          <img height={40} src={`data:image/png;base64,${props.data}`} />
        </>
      )}
      <div className="footer">
        {props.ocr ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              pasteOcr();
            }}
            className="ocr"
          >
            {props.ocr.trim()}
          </div>
        ) : (
          <div />
        )}
        <TimeAgo time={props.time} />
      </div>
    </div>
  );
}

export default Message;
