import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useLayoutEffect, useRef } from 'react';
import './index.css';

export default () => {
  const treeContainer = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    treeContainer.current = document.querySelector('.file-tree');
  }, []);

  return (
    <div className="header-container">
      <Button
        style={{ marginRight: 8 }}
        icon={<FileAddOutlined />}
        size="small"
      >
        代码片段
      </Button>
      <Button
        style={{ marginRight: 8 }}
        onClick={() => {
          treeContainer.current!.scrollTop = 999999;
        }}
        icon={<FolderAddOutlined />}
        size="small"
      >
        文件夹
      </Button>
      <Button icon={<DeleteOutlined />} size="small">
        删除
      </Button>
    </div>
  );
};
