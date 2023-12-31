import { useEffect, useState } from "react";
import { Input, Modal } from "antd";
import { manager } from "../../utils/history";

interface Props {
  visible: boolean;
  onChange: (v: boolean) => void;
  index: number;
}

export default (props: Props) => {
  const { visible, onChange, index } = props;
  const pin = manager.pins[index];
  const [title, setTitle] = useState(pin?.title || "");
  const [data, setData] = useState(pin?.data || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setOpen(true);
    }
  }, [visible]);

  return (
    <Modal
      afterClose={() => {
        onChange(false);
      }}
      title={`${pin ? "修改" : "添加"}快捷方式`}
      onCancel={() => setOpen(false)}
      open={open}
      cancelText="取消"
      okText="确定"
      onOk={() => {
        if (!pin) {
          manager.addPin({ title, data });
        } else {
          manager.editPin({ title, data, index });
        }

        setOpen(false);
      }}
    >
      <div style={{ marginBottom: 8 }}>名称</div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <div style={{ margin: "16px 0 8px" }}>内容</div>
      <Input.TextArea
        value={data}
        onChange={(e) => setData(e.target.value)}
        autoSize={{
          maxRows: 6,
          minRows: 3,
        }}
      />
    </Modal>
  );
};
