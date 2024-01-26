import { ClipItem } from "@/utils/history";
import { writeText, writeImage } from "tauri-plugin-clipboard-api";
import { hidePanelAndPaste } from "@/utils/paste";
import TimeAgo from "../TimeAgo";
import "./index.css";

function Message(
  props: ClipItem & {
    isActive: boolean;
    index: string;
    setActive: (v: string) => void;
  }
) {
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
      onMouseMove={() => props.setActive(props.index)}
      data-index={props.index}
      className={"box" + (props.isActive ? " hover" : "")}
      onClick={paste}
    >
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
