import { Modal, TreeSelect } from 'antd';
import { MacCommandOutlined } from '@ant-design/icons';
import type { DataNode } from 'rc-tree/lib/interface';
import './index.css';
import React, { useMemo } from 'react';

interface Props {
  treeData: DataNode[];
  onCancel: () => void;
  onSave: () => void;
  shortcuts: Record<string, number>;
  setShortcuts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default (props: Props) => {
  const treeSelectData = useMemo(() => {
    return props.treeData.map((folder) => {
      const temp = { ...folder };
      temp.children = temp.children.map((ele) => {
        return {
          ...ele,
          disabled: Number.isInteger(props.shortcuts[ele.key]),
          value: ele.key,
        };
      });
      return { ...folder, disabled: true, value: folder.key };
    });
  }, [props.treeData, props.shortcuts]);

  return (
    <Modal footer={null} visible onCancel={props.onCancel} title="设置快捷键">
      {Array(10)
        .fill(0)
        .map((_, index) => {
          const v = Object.entries(props.shortcuts).find(
            ([, v]) => v === index
          )?.[0];
          const value = v === 'undefined' ? undefined : v;
          return (
            <div className="row" key={index}>
              <div className="label">
                <MacCommandOutlined /> + {index}:
              </div>
              <div className="treeSelect">
                <TreeSelect
                  onChange={(key) => {
                    props.setShortcuts((s) => {
                      const temp = { ...s };
                      for (const key in temp) {
                        if (temp[key] === index) {
                          delete temp[key];
                        }
                      }
                      return {
                        ...temp,
                        [key as string]: index,
                      };
                    });
                  }}
                  value={value}
                  getPopupContainer={(p) => p?.parentNode}
                  treeDefaultExpandAll
                  allowClear
                  style={{ width: 392 }}
                  treeData={treeSelectData}
                />
              </div>
            </div>
          );
        })}
    </Modal>
  );
};
