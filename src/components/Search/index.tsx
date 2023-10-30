import { SearchOutlined } from "@ant-design/icons";
import { Input, InputRef } from "antd";
import { useRef, useState } from "react";
import { useVisibleChange } from "../../hooks/useVisibleChange";
import { manager } from "../../utils/history";
import "./index.css";

function App() {
  const [value, _onChange] = useState("");
  const ref = useRef<InputRef | null>();

  useVisibleChange({
    onShow: () => ref.current?.focus?.(),
    onHide: () => onChange(""),
  });

  const onChange = (val: string) => {
    _onChange(val);
    manager.search(val);
  };

  return (
    <Input
      className="searchBox"
      prefix={<SearchOutlined />}
      allowClear
      value={value}
      // onPressEnter={}
      onChange={(e) => onChange(e.target.value)}
      ref={(r) => (ref.current = r)}
    />
  );
}

export default App;
