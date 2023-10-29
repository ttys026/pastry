import { Input, InputRef } from "antd";
import { useRef, useState } from "react";
import { useVisibleChange } from "../../hooks/useVisibleChange";

function App() {
  const [value, onChange] = useState("");
  const ref = useRef<InputRef | null>();

  useVisibleChange({
    onShow: () => ref.current?.focus?.(),
    onHide: () => onChange(""),
  });

  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      ref={(r) => (ref.current = r)}
    />
  );
}

export default App;
