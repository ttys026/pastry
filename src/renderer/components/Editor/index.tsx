import { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './syntax.css';

export default function App() {
  const [code, setCode] = useState(`export default (selection) => {
  return \`console.log("\${Date.now()}", );\`
}`);
  return (
    <div id="editor">
      <Editor
        value={code}
        onValueChange={setCode}
        placeholder='Please enter your snippet...'
        highlight={(code) => highlight(code, languages.js)}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          height: '100%',
          outline: 'none',
          border: '1px solid #e8e8e8',
          borderTop: 0,
          boxShadow: 'none',
        }}
      />
    </div>
  );
}
