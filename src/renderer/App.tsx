import Tree from './components/Tree';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import Debugger from './components/Debugger';
import './App.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Empty from './components/Empty';
import { getContent, getTreeData, saveTreeData, setContent } from './services';
import { Spin } from 'antd';
import SplitPane from 'react-split-pane';
import { useSize } from 'ahooks';

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
  const container = useRef<HTMLDivElement>(null);
  const { height } = useSize(container.current);
  const [editorState, setEditorState] = useState({
    loading: true,
    selectedKey: '',
    initialValue: '',
  });
  const [treeData, _setTreeData] = useState([]);
  const [shortcuts, _setShortcuts] = useState<Record<string, number>>({});
  const [treeDataLoading, setTreeDataLoading] = useState(true);
  const [debuggerVisible, setDebuggerVisible] = useState(false);

  const isLeaf = useMemo(() => {
    return selectedKey && !treeData.find((ele) => ele.key === selectedKey);
  }, [selectedKey, treeData]);

  useEffect(() => {
    getTreeData().then(async (res) => {
      try {
        const shortcut = JSON.parse((await getContent('shortcut')) || '{}');
        _setShortcuts(shortcut);
        const data = res ? JSON.parse(res) : mock;
        setTreeData(data);
        setTreeDataLoading(false);
      } catch (e) {
        setTreeData([]);
        setTreeDataLoading(false);
      }
    });
    const toggleDebugger = () => {
      setDebuggerVisible(v => !v);
    }
    window.addEventListener('debugger', toggleDebugger);

    return () => {
      window.removeEventListener('debugger', toggleDebugger);
    }
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

  const setShortcuts: typeof _setShortcuts = useCallback((state) => {
    const newStateGetter: any =
      typeof state === 'function' ? state : () => state;
    _setShortcuts((s) => {
      const newState = newStateGetter(s);
      setContent('shortcut', JSON.stringify(newState));
      console.log('new state', newState);
      return newState;
    });
  }, []);

  useEffect(() => {
    setEditorState({ loading: true, initialValue: '', selectedKey: '' });
    getContent(selectedKey).then((res) => {
      setEditorState({ loading: false, initialValue: res, selectedKey });
    });
  }, [selectedKey]);

  return (
    <div id="container">
      <div id="toolbar">
        <Toolbar isLeaf={isLeaf} />
      </div>
      <div ref={container} id="content">
        <Tree
          shortcuts={shortcuts}
          setShortcuts={setShortcuts}
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
            <SplitPane
              split="horizontal"
              minSize={200}
              {...(debuggerVisible ? {} : { size: height + 5 })}
              defaultSize={debuggerVisible ? height - 200 : height + 5}
              allowResize={debuggerVisible}
              maxSize={height - 200}
              pane2Style={{ overflow: 'auto' }}
            >
              <Editor
                selectedKey={editorState.selectedKey}
                initialValue={editorState.initialValue}
              />
              {debuggerVisible && <Debugger />}
            </SplitPane>
          ) : (
            <Empty treeData={treeData} />
          )}
        </Spin>
      </div>
    </div>
  );
}
