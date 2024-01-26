import { Input, InputRef } from "antd";
import { useRef, useState } from "react";
import { useVisibleChange } from "@/hooks/useVisibleChange";
import { manager } from "@/utils/history";
import logo from "@/assets/logo.svg";
import "./index.css";

function Search({ onReset }: { onReset: () => void }) {
  const [value, _onChange] = useState("");
  const ref = useRef<InputRef | null>();

  useVisibleChange({
    onShow: () => {
      ref.current?.focus?.();
      onReset();
    },
    onHide: () => {
      onChange("");
      onReset();
    },
  });

  const onChange = (val: string) => {
    manager.search(val);
    _onChange(val);
    onReset();
  };

  return (
    <Input
      className="searchBox"
      tabIndex={-1}
      prefix={<img width={32} height={32} src={logo} alt="search" />}
      allowClear
      value={value}
      // onPressEnter={}
      spellCheck={false}
      autoCorrect=""
      onChange={(e) => onChange(e.target.value)}
      ref={(r) => (ref.current = r)}
    />
  );
}

export default Search;
