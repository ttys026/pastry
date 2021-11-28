import { useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './syntax.css';
import { getContent, setContent } from '../../services';

interface Props {
  selectedKey?: string;
}

export default function App(props: Props) {
  const [code, _setCode] = useState(`export default (selection) => {
  return \`console.log("\${Date.now()}", );\`
}`);

  const setCode = (c: string) => {
    _setCode(c);
    if (props.selectedKey) {
      setContent(props.selectedKey, c);
    }
  };

  useEffect(() => {
    if (!props.selectedKey) {
      // no shit
    } else {
      getContent(props.selectedKey).then((res) => {
        if (res === undefined) {
          if (props.selectedKey === 'demo-0') {
            _setCode(`() => \`console.log("pastry_\${Date.now()}", )\``);
            return;
          }
        } else {
          _setCode(res);
        }
      });
    }
  }, [props.selectedKey]);

  return (
    <div id="editor">
      <Editor
        value={code || ''}
        onValueChange={setCode}
        placeholder="Please enter your snippet..."
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
