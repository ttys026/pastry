import { Tree } from 'antd';
import { useRef, useState } from 'react';

interface Node {
  title: string;
  selectable?: boolean;
  isLeaf: boolean;
  key: string;
  children?: Node[];
}

const mock = [
  {
    title: 'parent 0',
    selectable: false,
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
    selectable: false,
    key: '0-1',
    children: [
      { title: 'leaf 1-0', key: '0-1-0', isLeaf: true },
      { title: 'leaf 1-1', key: '0-1-1', isLeaf: true },
      { title: 'leaf 1-2', key: '0-1-2', isLeaf: true },
      { title: 'leaf 1-3', key: '0-1-3', isLeaf: true },
    ],
  },
];

export default () => {
  const [treeData, setTreeData] = useState(mock);
  const [expandedKeys, setExpandedKeys] = useState(['0-0', '0-1']);
  const previousExpandedKeys = useRef<any>([]);
  const previousDragLeaf = useRef(true);
  const isDragging = useRef(false);
  const onSelect = (keys: React.Key[], info: any) => {
    console.log('Trigger Select', keys, info);
  };

  return (
    <Tree.DirectoryTree
      className='file-tree'
      multiple={false}
      expandedKeys={expandedKeys}
      draggable={{ icon: false }}
      // blockNode
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
        isDragging.current = true;
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
        isDragging.current = false;
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
                .slice(0, dropIndex - 1)
                .concat(dragItem)
                .concat(temp.slice(dropIndex));
            } else {
              return temp
                .slice(0, dropIndex)
                .concat(dragItem)
                .concat(temp.slice(dropIndex + 1));
            }
          });
        } else {
          // 拖拽叶子节点
          setTreeData((s) => {
            const temp = [...s];
            let dragDataNode: Node | undefined;
            // delete at old position
            temp.find((p) => {
              const dragIndex = p.children.findIndex(
                (ele) => ele.key === dragNode.key
              );
              if (dragIndex !== -1) {
                [dragDataNode] = p.children.splice(
                  p.children.findIndex((ele) => ele.key === dragNode.key),
                  1
                );
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
                const foundIndex = p.children.findIndex(
                  (ele) => ele.key === dropNode.key
                );
                if (foundIndex !== -1) {
                  let delta = 0;
                  if (dropPosition !== -1) {
                    delta += 1;
                  }
                  const breakPoint = foundIndex + delta;
                  p.children = p.children
                    .slice(0, breakPoint)
                    .concat(dragDataNode!)
                    .concat(p.children.slice(breakPoint));
                  return true;
                }
                return false;
              });
            } else {
              const parent = temp.find((ele) => ele.key === dropNode.key);
              parent?.children.unshift(dragDataNode);
            }
            return temp;
          });
        }
      }}
      onSelect={onSelect}
      onExpand={(keys) => {
        if (!isDragging.current) {
          setExpandedKeys(keys as string[]);
        }
      }}
      treeData={treeData}
    />
  );
};
