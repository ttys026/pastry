import { Tree } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DataNode } from 'rc-tree/lib/interface';
import EditableTitle from './EditableTitle';
import { findChild } from '../../utils';

const mock = [
  {
    title: 'parent 0',
    // selectable: false,
    key: '0-0',
    children: [
      { title: 'leaf 0-0', key: '0-0-0', isLeaf: true },
      { title: 'leaf 0-1', key: '0-0-1', isLeaf: true },
      { title: 'leaf 0-2', key: '0-0-2', isLeaf: true },
      { title: 'leaf 0-3', key: '0-0-3', isLeaf: true },
    ],
  },
  {
    title: 'parent 1',
    // selectable: false,
    key: '0-1',
    children: Array(40)
      .fill('')
      .map((_, index) => ({
        title: `leaf 1-0-${index}`,
        key: `0-1-${index}`,
        isLeaf: true,
      })),
  },
  {
    title: 'parent 2',
    // selectable: false,
    key: '0-2',
    children: [],
  },
  {
    title: 'parent 3',
    // selectable: false,
    key: '0-3',
    children: [],
  },
];

const getTreeData = async () =>
  await window.ipcRenderer.invoke('getData', 'tree');

const saveTreeData = async (data: string) => {
  await window.ipcRenderer.invoke('setData', { key: 'tree', data });
};

export default () => {
  const [key, setKey] = useState(0);
  const [treeData, _setTreeData] = useState<DataNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>([
    '0-0',
    '0-1',
  ]);
  const previousExpandedKeys = useRef<any>([]);
  const previousDragLeaf = useRef(true);
  const draggingNode = useRef<DataNode | null>(null);
  const onSelect = (_: React.Key[], info: any) => {
    setSelectedKeys([info.node.key]);
  };

  useEffect(() => {
    getTreeData().then((res) => {
      if (res === undefined) {
        _setTreeData(mock);
      } else {
        _setTreeData(JSON.parse(res || '[]'));
      }
    });
  }, []);

  const setTreeData: typeof _setTreeData = useCallback((state) => {
    const newStateGetter: any =
      typeof state === 'function' ? state : () => state;
    _setTreeData((s) => {
      const newState = newStateGetter(s);
      saveTreeData(JSON.stringify(newState));
      return newState;
    });
  }, []);

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
      <Tree.DirectoryTree
        key={key}
        expandAction={false}
        multiple={false}
        selectedKeys={selectedKeys}
        expandedKeys={expandedKeys}
        draggable={{ icon: false }}
        titleRender={(node) => {
          return (
            <EditableTitle
              value={node.title as string}
              width={node.isLeaf ? 177 : 201}
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
