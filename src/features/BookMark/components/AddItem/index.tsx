import { useEffect, useState } from "react";
import { Input, Modal } from "antd";

interface Props {
  visible: boolean;
  onChange: (v: boolean) => void;
  onConfirm: (v: BookMark) => void;
  data?: BookMark;
}

export default (props: Props) => {
  const { visible, onChange, data, onConfirm } = props;
  const [title, setTitle] = useState(() => data?.title || "");
  const [link, setLink] = useState(() => data?.link || "");
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
      title={`${data ? "修改" : "添加"}书签`}
      onCancel={() => setOpen(false)}
      open={open}
      cancelText="取消"
      okText="确定"
      onOk={() => {
        onConfirm({
          title,
          link,
          createTime: `${data?.createTime || Date.now()}`,
        });
        setOpen(false);
      }}
    >
      <div style={{ marginBottom: 8 }}>名称</div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <div style={{ margin: "16px 0 8px" }}>内容</div>
      <Input.TextArea
        value={link}
        onChange={(e) => setLink(e.target.value)}
        autoSize={{
          maxRows: 6,
          minRows: 3,
        }}
      />
    </Modal>
  );
};
