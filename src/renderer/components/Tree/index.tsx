import { Tree } from 'antd';
import { useRef, useState } from 'react';
import type { EventDataNode, DataNode } from 'rc-tree/lib/interface';
import EditableTitle from './EditableTitle';

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

export default () => {
  const [key, setKey] = useState(0);
  const [treeData, setTreeData] = useState<DataNode[]>(mock);
  const [expandedKeys, setExpandedKeys] = useState<Array<string | number>>([
    '0-0',
    '0-1',
  ]);
  const previousExpandedKeys = useRef<any>([]);
  const previousDragLeaf = useRef(true);
  const draggingNode = useRef<EventDataNode | null>(null);
  const onSelect = (keys: React.Key[], info: any) => {
    console.log('Trigger Select', keys, info);
  };

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
            temp.find((p) => {
              const foundIndex = p.children?.findIndex((ele) => {
                return ele.key === node.key;
              });
              if (foundIndex !== -1) {
                p.children?.splice(foundIndex!, 1);
                return true;
              }
              return false;
            });
            temp[temp.length - 1].children?.push(node);
            return temp;
          });
        } else {
          setTreeData((s) => {
            const temp = [...s];
            const removed = temp.splice(
              temp.findIndex((ele) => ele.key === node!.key),
              1
            );
            return temp.concat(removed);
          });
        }
        setKey((k) => k + 1);
      }}
      id="tree-container"
    >
      <Tree.DirectoryTree
        key={key}
        expandAction={false}
        multiple={false}
        expandedKeys={expandedKeys}
        draggable={{ icon: false }}
        titleRender={(node) => {
          return (
            <EditableTitle
              value={node.title as string}
              width={node.isLeaf ? 177 : 201}
              onChange={(newValue) => {
                if (node.isLeaf) {
                  setTreeData((d) => {
                    const temp = [...d];
                    temp.find((p) => {
                      const found = p.children?.find((ele) => {
                        ele.key === node.key;
                      });
                      if (found) {
                        found.title = newValue;
                        return true;
                      }
                      return false;
                    });
                    return temp;
                  });
                }
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
          if ((!!info.dragNode.isLeaf === !!info.dropNode.isLeaf) === false) {
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
          if (!dragNode.isLeaf) {
            // 拖拽文件夹
            setTreeData((s) => {
              const temp = [...s];
              const dragItem = temp.splice(
                temp.findIndex((ele) => ele.key === dragNode.key),
                1
              );
              const dropIndex = s.findIndex((ele) => ele.key === dropNode.key);
              if (dropPosition === -1) {
                return temp
                  .slice(0, dropIndex)
                  .concat(dragItem)
                  .concat(temp.slice(dropIndex));
              } else {
                return temp
                  .slice(0, dropIndex + 1)
                  .concat(dragItem)
                  .concat(temp.slice(dropIndex + 1));
              }
            });
          } else {
            // 拖拽叶子节点
            setTreeData((s) => {
              const temp = [...s];
              let dragDataNode: DataNode | undefined;
              // delete at old position
              temp.find((p) => {
                const dragIndex = p.children?.findIndex(
                  (ele) => ele.key === dragNode.key
                );
                if (dragIndex !== -1) {
                  [dragDataNode] =
                    p.children?.splice(
                      p.children?.findIndex((ele) => ele.key === dragNode.key),
                      1
                    ) || [];
                  return true;
                }
                return false;
              });
              if (!dragDataNode) {
                throw new Error('error happens');
              }
              // insert at new position
              if (dropNode.isLeaf) {
                temp.find((p) => {
                  const foundIndex =
                    p.children?.findIndex((ele) => ele.key === dropNode.key) ??
                    -1;
                  if (foundIndex !== -1) {
                    let delta = 0;
                    if (dropPosition !== -1) {
                      delta += 1;
                    }
                    const breakPoint = foundIndex + delta;
                    p.children = (p.children || [])
                      .slice(0, breakPoint)
                      .concat(dragDataNode!)
                      .concat((p.children || []).slice(breakPoint));
                    return true;
                  }
                  return false;
                });
              } else {
                const parent = temp.find((ele) => ele.key === dropNode.key);
                parent?.children?.unshift(dragDataNode);
              }
              return temp;
            });
          }
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
