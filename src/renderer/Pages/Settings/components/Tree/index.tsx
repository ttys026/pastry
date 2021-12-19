import { Tree, Modal } from 'antd';
import {
  MacCommandOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import type { DataNode } from 'rc-tree/lib/interface';
import EditableTitle from './EditableTitle';
import { findChild, isFakeRoot } from '../../../../utils';
import ShortcutModal from '../ShortcutModal';
import { removeContent } from '../../../../services';

const getNewNode = () => ({
  isLeaf: true,
  title: 'new scriptlet',
  key: `file-${Date.now()}`,
});

const getNewFolder = () => ({
  children: [],
  title: 'new folder',
  key: `folder-${Date.now()}`,
});

interface Props {
  treeData: DataNode[];
  setTreeData: React.Dispatch<React.SetStateAction<DataNode[]>>;
  selectedKeys: string[];
  setSelectedKeys: (ks: string[]) => void;
  shortcuts: Record<string, number>;
  setShortcuts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default (props: Props) => {
  const {
    selectedKeys,
    setSelectedKeys,
    treeData,
    setTreeData: setTreeData,
    shortcuts = {},
    setShortcuts,
  } = props;
  const [key, setKey] = useState(0);
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>(
    treeData.map((ele) => ele.key)
  );
  const [shortcutVisible, setShortcutVisible] = useState<boolean>(false);
  const previousExpandedKeys = useRef<any>([]);
  const previousDragLeaf = useRef(true);
  const draggingNode = useRef<DataNode | null>(null);
  const onSelect = (_: React.Key[], info: any) => {
    setSelectedKeys([info.node.key]);
  };

  const selectedKeyRef = useRef(selectedKeys[0]);
  selectedKeyRef.current = selectedKeys[0];

  const treeDataRef = useRef(treeData);
  treeDataRef.current = treeData;

  useEffect(() => {
    const addFileListener = () => {
      setTreeData((s) => {
        const temp = [...s];
        return findChild(
          {
            tree: temp,
            node: {
              key: selectedKeyRef.current,
              isLeaf: temp.every((ele) => ele.key !== selectedKeyRef.current),
            },
          },
          (i) => ({
            parent: (parent) => {
              const newFile = getNewNode();
              setSelectedKeys([newFile.key]);
              if (isFakeRoot(parent)) {
                setExpandedKeys((k) => [...k, parent.children[i].key]);
                parent.children[i].children.push(newFile);
              } else {
                setExpandedKeys((k) => [...k, parent.key]);
                parent.children.push(newFile);
              }
            },
          })
        );
      });
    };

    const addFolderListener = () => {
      setTreeData((s) => {
        const newFolder = getNewFolder();
        setSelectedKeys([newFolder.key]);
        setExpandedKeys((k) => [...k, newFolder.key]);
        return [...s, newFolder];
      });
    };

    const removeItem = () => {
      const foundFolder = treeDataRef.current.find(
        (ele) => ele.key === selectedKeyRef.current
      );
      const isLeaf = !foundFolder;

      const doDelete = () => {
        setTreeData((s) => {
          const temp = [...s];
          setShortcuts((s) => {
            const temp = { ...s };
            delete temp[selectedKeyRef.current];
            return temp;
          });
          setSelectedKeys([]);
          return findChild(
            { tree: temp, node: { key: selectedKeyRef.current, isLeaf } },
            (i) => ({
              parent: (parent) => {
                removeContent(selectedKeyRef.current);
                if (isFakeRoot(parent)) {
                  removeContent(parent.children.map(ele => ele.key as string))
                }
                parent.children.splice(i, 1);
              },
            })
          );
        });
      };

      if (foundFolder && foundFolder.children.length) {
        Modal.confirm({
          title: '确认删除',
          content:
            '确认要删除该文件夹吗？删除文件夹会移除该文件夹下的所有脚本。',
          okText: '删除',
          cancelText: '取消',
          onOk: () => {
            doDelete();
          },
        });
      } else {
        doDelete();
      }
    };

    const setShortcut = () => {
      setShortcutVisible(true);
      // 123
    };

    window.addEventListener('new-file', addFileListener);
    window.addEventListener('new-folder', addFolderListener);
    window.addEventListener('delete', removeItem);
    window.addEventListener('shortcut', setShortcut);

    return () => {
      window.removeEventListener('new-file', addFileListener);
      window.removeEventListener('new-folder', addFolderListener);
      window.removeEventListener('delete', removeItem);
      window.removeEventListener('shortcut', setShortcut);
    };
  }, []);

  useEffect(() => {
    if (!selectedKeyRef.current) {
      setExpandedKeys(treeData.map((ele) => ele.key));
    }
  }, [treeData]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        // setDraggingToBg(false);
        const node = draggingNode.current;
        draggingNode.current = null;
        if (node?.isLeaf) {
          setTreeData((s) => {
            const temp = [...s];
            findChild({ tree: temp, node }, (i) => ({
              self: (self) => {
                temp[temp.length - 1].children!.push(self);
              },
              parent: (parent) => {
                parent.children!.splice(i, 1);
              },
            }));
            return temp;
          });
        } else {
          setTreeData((s) => {
            const temp = [...s];
            let removed: DataNode[] = [];
            findChild({ tree: temp, node: node! }, (i) => ({
              self: () => {
                removed = temp.splice(i, 1);
              },
            }));
            return temp.concat(removed);
          });
        }
        // HACK: placeholder 不会消失，需要更新一下 tree 的 key
        setKey((k) => k + 1);
      }}
      id="tree-container"
    >
      {shortcutVisible && (
        <ShortcutModal
          onCancel={() => setShortcutVisible(false)}
          setShortcuts={setShortcuts}
          onSave={() => {}}
          treeData={treeData}
          shortcuts={shortcuts}
        />
      )}
      <Tree.DirectoryTree
        key={key}
        expandAction={false}
        multiple={false}
        selectedKeys={selectedKeys}
        icon={(node) => {
          if (!node.isLeaf) {
            return node.expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
          }
          return Number.isInteger(shortcuts[node.eventKey]) ? (
            <MacCommandOutlined />
          ) : (
            <FileOutlined />
          );
        }}
        expandedKeys={expandedKeys}
        draggable={{ icon: false }}
        titleRender={(node) => {
          return (
            <EditableTitle
              value={node.title as string}
              shortcut={shortcuts[node.key]}
              width={node.isLeaf ? 180 : 204}
              selected={selectedKeys.includes(node.key as string)}
              onChange={(newValue) => {
                setTreeData((d) => {
                  const temp = [...d];
                  return findChild({ tree: temp, node }, () => ({
                    self: (self) => {
                      self.title = newValue;
                    },
                  }));
                });
              }}
            />
          );
        }}
        allowDrop={(info) => {
          if (info.dropNode.isLeaf && info.dropPosition === 0) {
            return false;
          }
          if (
            !info.dropNode.isLeaf &&
            info.dragNode.isLeaf &&
            info.dropPosition !== 0
          ) {
            return false;
          }
          if (!info.dragNode.isLeaf && info.dropNode.isLeaf) {
            return false;
          }
          if (
            !info.dragNode.isLeaf &&
            !info.dropNode.isLeaf &&
            info.dropPosition === 0
          ) {
            return false;
          }
          return true;
        }}
        onDragStart={(info) => {
          draggingNode.current = info.node;
          if (!info.node.isLeaf) {
            previousExpandedKeys.current = expandedKeys;
            previousDragLeaf.current = false;
            setExpandedKeys([]);
          } else {
            previousDragLeaf.current = true;
            previousExpandedKeys.current = [];
          }
        }}
        onDragEnd={() => {
          draggingNode.current = null;
          if (!previousDragLeaf.current) {
            const shouldExpandKeys = previousExpandedKeys.current;
            requestAnimationFrame(() => {
              setExpandedKeys(shouldExpandKeys);
            });
            previousDragLeaf.current = true;
            previousExpandedKeys.current = [];
          }
        }}
        onDrop={(info) => {
          draggingNode.current = null;
          const { dragNode, node: dropNode, dropPosition } = info;
          setTreeData((s) => {
            const temp = [...s];
            let dragItem: DataNode;
            findChild({ tree: temp, node: dragNode }, (i) => ({
              parent: (parent) => {
                [dragItem] = (parent.children || []).splice(i, 1);
              },
            }));
            return findChild({ tree: temp, node: dropNode }, (i) => ({
              parent: (parent) => {
                if (dragNode.isLeaf && !dropNode.isLeaf) {
                  ((parent.children || [])[i].children || []).unshift(dragItem);
                } else {
                  const breakPoint = i + (dropPosition === -1 ? 0 : 1);
                  parent.children = parent
                    .children!.slice(0, breakPoint)
                    .concat(dragItem)
                    .concat(parent.children!.slice(breakPoint));
                }
              },
            }));
          });
        }}
        onSelect={onSelect}
        onExpand={(keys) => {
          if (!draggingNode.current) {
            setExpandedKeys(keys as string[]);
          }
        }}
        treeData={treeData}
      />
    </div>
  );
};
