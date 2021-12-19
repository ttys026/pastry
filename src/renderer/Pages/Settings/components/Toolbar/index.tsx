import {
  FolderAddOutlined,
  FileAddOutlined,
  DeleteOutlined,
  MacCommandOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useLayoutEffect, useRef } from 'react';
import './index.css';

interface Props {
  isLeaf: boolean;
}

export default (props: Props) => {
  const treeContainer = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    treeContainer.current = document.querySelector('#tree-container');
  }, []);

  return (
    <div className="header-container">
      <div>
        <Button
          style={{ marginRight: 8 }}
          icon={<FileAddOutlined />}
          size="small"
          onClick={() => {
            window.dispatchEvent(new Event('new-file'));
          }}
        >
          代码片段
        </Button>
        <Button
          style={{ marginRight: 8 }}
          onClick={() => {
            window.dispatchEvent(new Event('new-folder'));
            treeContainer.current!.scrollTop = 999999;
          }}
          icon={<FolderAddOutlined />}
          size="small"
        >
          文件夹
        </Button>
        <Button
          style={{ marginRight: 8 }}
          onClick={() => {
            window.dispatchEvent(new Event('shortcut'));
          }}
          icon={<MacCommandOutlined />}
          size="small"
        >
          快捷键
        </Button>
        <Button
          onClick={() => {
            window.dispatchEvent(new Event('delete'));
          }}
          icon={<DeleteOutlined />}
          size="small"
        >
          删除
        </Button>
      </div>
      <div>
        {props.isLeaf && (
          <Button
            style={{ float: 'right' }}
            onClick={() => {
              window.dispatchEvent(new Event('debugger'));
            }}
            icon={<CodeOutlined />}
            size="small"
          >
            调试
          </Button>
        )}
      </div>
    </div>
  );
};
