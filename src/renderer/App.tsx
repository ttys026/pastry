// import { useState } from 'react';
import Tree from './components/Tree';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';
import './App.css';

export default function App() {
  return (
    <div id="container">
      <div id="toolbar">
        <Toolbar />
      </div>
      <div id="content">
        <Tree />
        <Editor />
      </div>
    </div>
  );
}
