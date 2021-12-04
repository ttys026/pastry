import type { DataNode } from 'rc-tree/lib/interface';

const noop = () => {};

export const findChild = (
  source: {
    tree: DataNode[],
    node: DataNode,
  },
  action: (index: number) => {
    self?: (v: DataNode) => void,
    parent?: (v: DataNode) => void,
  }
) => {
  const { node, tree } = source;
  const fakeRoot = { children: tree, key: 'ROOT' };
  if (node.isLeaf) {
    fakeRoot.children.find(p => {
      const foundIndex = (p.children || []).findIndex(ele => ele.key === node.key);
      if(foundIndex !== -1) {
        const { self = noop, parent = noop } = action(foundIndex);
        self(p.children![foundIndex]);
        parent(p);
        return true;
      }
      return false;
    })
  } else {
    const foundIndex = fakeRoot.children.findIndex((ele) => ele.key === node.key);
    if (foundIndex !== -1) {
      action(foundIndex).self?.(fakeRoot.children[foundIndex]);
      action(foundIndex).parent?.(fakeRoot);
    }
  }
  return fakeRoot.children;
};

export const isFakeRoot = (node: DataNode) => {
  return node.key === 'ROOT';
}