// import { useState } from 'react';
import Tree from './components/Tree';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import './App.css';
import { useState } from 'react';

export default function App() {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  return (
    <div id="container">
      <div id="toolbar">
        <Toolbar />
      </div>
      <div id="content">
        <Tree selectedKeys={selectedKeys} setSelectedKeys={setSelectedKeys} />
        <Editor selectedKey={selectedKeys[0]} />
      </div>
    </div>
  );
}
