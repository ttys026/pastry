import Tree from './components/Tree';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import './App.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Empty from './components/Empty';
import { getContent, getTreeData, saveTreeData } from './services';
import { Spin } from 'antd';

const mock = [
  {
    title: 'demo',
    key: '0-0',
    children: [{ title: 'console.log', key: 'demo-0', isLeaf: true }],
  },
];

export default function App() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const selectedKey = selectedKeys[0];
  const [editorState, setEditorState] = useState({
    loading: true,
    selectedKey: '',
    initialValue: '',
  });
  const [treeData, _setTreeData] = useState([]);
  const [treeDataLoading, setTreeDataLoading] = useState(true);

  const isLeaf = useMemo(() => {
    return !treeData.find((ele) => ele.key === selectedKey);
  }, [selectedKey, treeData]);

  useEffect(() => {
    getTreeData().then((res) => {
      const data = res ? JSON.parse(res) : mock;
      setTreeData(data);
      setTreeDataLoading(false);
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

  useEffect(() => {
    setEditorState({ loading: true, initialValue: '', selectedKey: '' });
    getContent(selectedKey).then((res) => {
      console.log('11111', res);
      setEditorState({ loading: false, initialValue: res, selectedKey });
    });
  }, [selectedKey]);

  return (
    <div id="container">
      <div id="toolbar">
        <Toolbar />
      </div>
      <div id="content">
        <Tree
          treeData={treeData}
          setTreeData={setTreeData}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
        />
        <Spin
          wrapperClassName="loadingContainer"
          spinning={treeDataLoading || editorState.loading}
        >
          {selectedKey && isLeaf ? (
            <Editor
              selectedKey={editorState.selectedKey}
              initialValue={editorState.initialValue}
            />
          ) : (
            <Empty />
          )}
        </Spin>
      </div>
    </div>
  );
}
