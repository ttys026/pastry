import { Input } from 'antd';
import { useState } from 'react';
import { useKeyPress } from 'ahooks';

interface Props {
  value: string;
  onChange: (v: string) => void;
  width: number;
  selected: boolean;
  shortcut?: number;
}

const SingleLineInput = ({
  value,
  onChange,
  quitEdit,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  quitEdit: () => void;
  width: number;
}) => {
  useKeyPress('Enter', quitEdit);
  return (
    <Input
      size="small"
      autoFocus
      style={{ position: 'absolute', maxWidth: width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={quitEdit}
    />
  );
};

const SingleLineText = ({
  value,
  enterEdit,
  width,
  shortcut,
}: {
  value: string;
  enterEdit: () => void;
  width: number;
  shortcut?: number;
}) => {
  useKeyPress('Enter', () => {
    if (document.activeElement?.tagName !== 'TEXTAREA') {
      enterEdit();
    }
  });
  return (
    <span
      title=""
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width,
        maxWidth: width,
        display: 'table-cell',
      }}
      onDoubleClick={enterEdit}
    >
      {Number.isInteger(shortcut) && (
        <span>+&nbsp;{shortcut}:&nbsp;</span>
      )}
      {value}
    </span>
  );
};

export default (props: Props) => {
  const [mode, setMode] = useState<'display' | 'edit'>('display');
  const [value, setValue] = useState(props.value);
  return mode === 'display' ? (
    <>
      {props.selected ? (
        // selected 组件，监听了回车事件
        <SingleLineText
          value={value}
          shortcut={props.shortcut}
          enterEdit={() =>
            setMode((v) => (v === 'display' ? 'edit' : 'display'))
          }
          width={props.width - 5}
        />
      ) : (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: props.width - 5,
            maxWidth: props.width - 5,
            display: 'table-cell',
          }}
          onDoubleClick={() =>
            setMode((v) => (v === 'display' ? 'edit' : 'display'))
          }
        >
          {Number.isInteger(props.shortcut) && (
            <span style={{ color: 'rgba(0,0,0,0.45)'}}>+&nbsp;{props.shortcut}:&nbsp;</span>
          )}
          {value}
        </span>
      )}
    </>
  ) : (
    <SingleLineInput
      width={props.width}
      value={value}
      onChange={setValue}
      quitEdit={() => {
        setMode('display');
        props.onChange(value);
      }}
    />
  );
};
