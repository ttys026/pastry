import { Input } from 'antd';
import { useState } from 'react';
import { useKeyPress } from 'ahooks';

interface Props {
  value: string;
  onChange: (v: string) => void;
  width: number;
  selected: boolean;
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
}: {
  value: string;
  enterEdit: () => void;
  width: number;
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
        <SingleLineText
          value={value}
          enterEdit={() =>
            setMode((v) => (v === 'display' ? 'edit' : 'display'))
          }
          width={props.width - 5}
        />
      ) : (
        <span
          title=""
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
