import { useEffect, useRef } from 'react';
import { setContent } from '../../../../services';
import { js, JSBeautifyOptions } from 'js-beautify';
import * as monaco from 'monaco-editor';
import './loader';
import { useKeyPress } from 'ahooks';

interface Props {
  selectedKey?: string;
  initialValue: string;
}

const formatOption: JSBeautifyOptions = {
  space_in_paren: false,
  indent_empty_lines: false,
  end_with_newline: true,
  max_preserve_newlines: 1,
  preserve_newlines: true,
  indent_size: 2,
};

export default function App(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  useKeyPress(['meta.s'], () => {
    window.dispatchEvent(new Event('format'));
  });
  const selectedKeyRef = useRef(props.selectedKey);
  selectedKeyRef.current = props.selectedKey;

  useEffect(() => {
    if (ref.current) {
      editor.current = monaco.editor.create(ref.current, {
        value: '',
        cursorWidth: 1,
        // language: 'typescript',
        language: 'javascript',
        automaticLayout: true,
        tabSize: 2,
        fixedOverflowWidgets: true,
        minimap: {
          enabled: false,
        },
      });
    }

    const formatter = {
      provideDocumentFormattingEdits(model) {
        return [
          {
            text: js(model.getValue(), formatOption),
            range: model.getFullModelRange(),
          },
        ];
      },
    };

    monaco.languages.registerDocumentFormattingEditProvider(
      'javascript',
      formatter
    );

    const removeListener = editor.current
      ?.getModel()
      ?.onDidChangeContent(() => {
        const value = editor.current?.getValue() || '';
        if (selectedKeyRef.current) {
          setContent(selectedKeyRef.current, value);
        }
      });

    const format = () => {
      editor.current?.getAction('editor.action.formatDocument').run();
    };

    window.addEventListener('format', format);

    return () => {
      window.removeEventListener('format', format);
      removeListener?.dispose();
    };
  }, []);

  useEffect(() => {
    editor.current?.setValue(props.initialValue || '');
  }, [props.initialValue, props.selectedKey]);

  return <div ref={ref} id="editor" />;
}
